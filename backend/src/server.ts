import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Routes
import travelRoutes from './routes/travel';
import benefitRoutes from './routes/benefit';
import testRoutes from './routes/test';
import photoRouter from './routes/photo';
import aiRoutes from './routes/ai';
import bookmarkRoutes from './routes/bookmark';

// Supabase 연결 테스트
import { testSupabaseConnection } from './config/supabase';

dotenv.config();

const app = express();

/**
 * ⚠️ 중요: Railway에서는 외부로 노출되는 포트는 프론트(Next)가 차지합니다.
 * 백엔드는 내부 포트(예: 4000)를 사용하고, Next의 rewrites로 프록시합니다.
 * 루트 package.json에서 BACKEND_PORT=4000으로 넘겨주고 있으니 여기도 동일하게.
 */
const PORT = Number(process.env.BACKEND_PORT || 4000);

// 프록시 환경(예: Railway, Vercel 등)에서 신뢰 설정
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// 프록시 경유(Next -> 127.0.0.1:4000) 시 브라우저는 Next 도메인만 보므로
// CORS는 대부분 필요 없습니다. 다만 직접 호출 가능성을 고려해 아래처럼 유연하게 설정합니다.
const PROD = process.env.NODE_ENV === 'production';
const allowedOrigins = PROD
  ? (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : [])
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // 서버-서버(Next 프록시)나 툴링 등 Origin이 없을 수 있음 → 허용
    if (!origin) return callback(null, true);
    // 프로덕션에서 FRONTEND_URL이 지정되어 있다면 화이트리스트 체크
    if (allowedOrigins.length > 0) {
      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error(`CORS blocked: ${origin}`));
    }
    // FRONTEND_URL 미설정이면 전부 허용(프록시 환경에서 문제 없음)
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  credentials: true,
}));

app.use(morgan(PROD ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (통일된 경로)
app.use('/api/travel', travelRoutes);
app.use('/api/benefits', benefitRoutes);   // 복수형 유지
app.use('/api/test', testRoutes);
app.use('/api', photoRouter);
app.use('/api/ai', aiRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Health check
app.get('/api/health', async (_req, res) => {
  const dbConnected = await testSupabaseConnection();
  res.status(200).json({
    status: 'OK',
    message: 'Travel Recommendation Service Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    database: dbConnected ? 'connected' : 'disconnected',
    services: {
      supabase: dbConnected,
      googleMaps: !!process.env.GOOGLE_MAPS_API_KEY,
      kakao: !!process.env.KAKAO_REST_API_KEY
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      'GET /api/health',
      'GET /api/benefits',
      'POST /api/travel/recommend',
      'GET /api/travel/local-experiences/:region',
      'GET /api/travel/destination/:id',
      'POST /api/ai/chat',
      'POST /api/ai/generate-routes',
      'GET /api/ai/search-places'
    ]
  });
});

// Error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('🔴 Server Error:', message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: message })
  });
});

// 서버 시작 (0.0.0.0로 바인딩)
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 API server is listening on 0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://127.0.0.1:${PORT}/api/health`);

  const dbStatus = await testSupabaseConnection();
  console.log(`💾 Database: ${dbStatus ? '✅ Connected' : '❌ Disconnected'}`);
});

export default app;
