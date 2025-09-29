'use client';

import { useRouter } from 'next/navigation';

interface LocalDealsSectionProps {
  title?: string;
  limit?: number;
  layout?: 'card' | 'list';
}

export default function LocalDealsSection({ 
  title = "단기간 오픈! 여름을 가지로 받는 로컬딜",
  limit,
  layout = 'list'
}: LocalDealsSectionProps) {
  const router = useRouter();

  const deals = [
    { id: 1, title: "호미켄즈", description: "캔들 만들기 체험 쿠폰 제공", tag: "1+1" },
    { id: 2, title: "신촌 형제갈비", description: "2인분 주문시 냉면 서비스", tag: "서비스" },
    { id: 3, title: "블레싱데이", description: "체험활동 재료비 무료", tag: "서비스" },
    { id: 4, title: "산울림 1992", description: "런치세트 20% 할인", tag: "할인" }
  ];

  const displayDeals = limit ? deals.slice(0, limit) : deals;

  const handleDealClick = (dealId: number) => {
    // 개별 딜 클릭시 지도에서 해당 위치로 이동 (선택사항)
    router.push(`/Map?dealId=${dealId}`);
  };

  const handleMoreDeals = () => {
    // 더 많은 로컬딜 보기 클릭시 지도 페이지로 이동 (딜 필터 적용)
    router.push('/Map?filter=deals');
  };

  return (
    <section className="py-6 px-4">
      <div className="mb-4 flex items-center">
        <span className="text-orange-500 mr-2"></span>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      
      <div className={`grid ${layout === 'card' ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
        {displayDeals.map((deal) => (
          <div 
            key={deal.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            // onClick={() => handleDealClick(deal.id)}
          >
            {layout === 'card' ? (
              <>
                <div className="h-24 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">📷</span>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm">{deal.title}</h3>
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">{deal.tag}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{deal.description}</p>
                  <button 
                    className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // 카드 클릭 이벤트와 분리
                      handleDealClick(deal.id);
                    }}
                  >
                    자세히 보기
                  </button>
                </div>
              </>
            ) : (
              <div className="flex">
                <div className="w-24 h-20 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">📷</span>
                </div>
                <div className="flex-1 p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm">{deal.title}</h3>
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">{deal.tag}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{deal.description}</p>
                  <button 
                    className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // 카드 클릭 이벤트와 분리
                      handleDealClick(deal.id);
                    }}
                  >
                    자세히 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleMoreDeals}
        className="w-full mt-4 py-3 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors"
      >
        더 많은 로컬딜 보기
      </button>
    </section>
  );
}