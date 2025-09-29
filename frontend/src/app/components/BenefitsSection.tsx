'use client';

import { useRouter } from 'next/navigation';

interface BenefitsSectionProps {
  title?: string;
  limit?: number;
  showMore?: boolean;
}

export default function BenefitsSection({ 
  title = "청년 혜택 정보", 
  limit,
  showMore = true 
}: BenefitsSectionProps) {
  const router = useRouter();

  const benefits = [
    {
      id: 1,
      title: "청년쉼표 프로젝트",
      discount: "최대 50만원",
      description: "미취업 청년 대상 바우처 지급",
      category: "문화",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: 2,
      title: "제주 관광 세이브 쿠폰",
      discount: "할인권",
      description: "만 19세~29세 청년 여행객 대상",
      category: "여행",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      title: "강원 청년 교통비 환급",
      discount: "환급",
      description: "만 19세~34세 청년 여행객 대상, 일정비율 환급",
      category: "교통",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  const displayBenefits = limit ? benefits.slice(0, limit) : benefits;

  const handleBenefitClick = (benefitId: number) => {
    // 개별 혜택 클릭시 상세 페이지로 이동 (선택사항)
    router.push(`/benefits/${benefitId}`);
  };

  const handleMoreBenefits = () => {
    // 더 많은 혜택 보기 클릭시 benefits 페이지로 이동
    router.push('/benefits');
  };

  return (
    <section className="py-6 px-4">
      <div className="mb-4 flex items-center">
        <span className="text-blue-500 mr-2"></span>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      
      <div className="space-y-3">
        {displayBenefits.map((benefit) => (
          <div 
            key={benefit.id} 
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 min-h-32 cursor-pointer hover:shadow-md transition-shadow"
            // onClick={() => handleBenefitClick(benefit.id)}
          >
            <div className="flex justify-between items-start mb-4">
              {/* 좌측: 제목 + 카테고리 + 설명 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">{benefit.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${benefit.bgColor} ${benefit.color}`}>
                    {benefit.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{benefit.description}</p>
              </div>
              
              {/* 우측: 할인금액 */}
              <div className="ml-4 text-right">
                <span className={`text-xl font-bold ${benefit.color}`}>{benefit.discount}</span>
                <div className="text-xs text-gray-500">제공</div>
              </div>
            </div>
            
            {/* 하단: 신청가능 + 신청하기 */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">신청가능</span>
              <button 
                className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // 카드 클릭 이벤트와 분리
                  handleBenefitClick(benefit.id);
                }}
              >
                신청하기
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {showMore && (
        <button 
          onClick={handleMoreBenefits}
          className="w-full mt-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
          더 많은 혜택 보기
        </button>
      )}
    </section>
  );
}