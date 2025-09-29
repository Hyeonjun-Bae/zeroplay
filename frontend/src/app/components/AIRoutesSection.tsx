'use client';

import { useRouter } from 'next/navigation';

interface AIRoutesSectionProps {
  title?: string;
  showRoutes?: boolean;  // boolean은 이걸로 변경
  routes?: Array<{       // 실제 routes 데이터 타입 정의
    id: string;
    title: string;
    description: string;
    duration: string;
    budget: string;
  }>;
}

export default function AIRoutesSection({ 
      title = "AI 루트 추천",
      showRoutes = true,     // 변수명 변경
      routes = [             // 기본 데이터 제공
        {
          id: '1',
          title: '도심 속 힐링 코스',
          description: '산책과 전시로 즐기는 여유로운 하루',
          duration: '6시간',
          budget: '10만원대'
        },
        {
          id: '2', 
          title: '한라산 자연 탐방',
          description: '숲길 따라 걷는 청량한 한라산 트래킹',
          duration: '8시간',
          budget: '5만원대'
        },
        {
          id: '3',
          title: '자연 속 카페 투어', 
          description: '자연 풍경 속 감성 가득 카페 여행',
          duration: '6시간',
          budget: '2만원대'
        }
      ]
      }: AIRoutesSectionProps) {
        
        const router = useRouter();

        const handleRouteClick = (routeId: string) => {
          // 개별 루트 클릭시 상세 페이지로 이동 (선택사항)
          router.push(`/AI-route/routes/${routeId}`);
        };

        const handleAIPlanning = () => {
          // AI 여행 계획 세우기 버튼 클릭시 AI-route 페이지로 이동
          router.push('/AI-route');
        };

        return (
          <section className="py-6 px-4 bg-white">
            <div className="mb-4 flex items-center">
              <span className="text-purple-500 mr-2"></span>
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            </div>
            
            {showRoutes && (
        <div className="space-y-0 border-t border-gray-100">
          {routes.map(route => (
            <div 
              key={route.id} 
              className="flex items-center p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
              // onClick={() => handleRouteClick(route.id)}
            >
              {/* 왼쪽 아이콘 */}
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-purple-600 text-lg">🗺️</span>
              </div>
              
              {/* 중간 정보 */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">{route.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{route.description}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">{route.duration}</span>
                </div>
              </div>
              
              {/* 오른쪽 가격 */}
              <div className="text-right">
                <span className="text-sm font-bold text-purple-600">{route.budget}</span>
                <div className="text-xs text-gray-500 mt-1">예상 비용</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
            <button 
              onClick={handleAIPlanning}
              className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium mt-4 hover:bg-purple-600 transition-colors"
            >
              AI와 여행 계획 세우기
            </button>
          
          </section>
  );
}