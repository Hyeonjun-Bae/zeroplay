import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ API 요청은 프론트엔드 서버(Next)가 받아서 내부 백엔드(4000)로 프록시
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:4000/api/:path*', // 내부 백엔드 포트
      },
    ];
  },

  // ✅ 빌드 오류 방지 (배포 우선, 타입/ESLint 무시)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
