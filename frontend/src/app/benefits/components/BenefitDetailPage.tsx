'use client'

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Bookmark } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface BenefitDetailData {
  id: number;
  title: string;
  organization: string;
  amount: string;
  amountType: string;
  amount_type: string;
  detailed_content: string;
  eligibility_details: string;
  application_process: string;
  important_notes: string;
  website_url?: string;
  period: string;
  eligibility: string;
}

const BenefitDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const benefitId = (params?.id as string) || '';

  const [benefit, setBenefit] = useState<BenefitDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSafariMobile, setIsSafariMobile] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 공용 JSON fetch 유틸 (상대경로 + 에러/파싱 가드)
  const fetchJson = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`응답 파싱 실패: ${text}`);
    }

    if (!res.ok) {
      const msg = data?.message || res.statusText;
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    return data;
  };

  useEffect(() => {
    const checkSafariMobile = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        /Safari/.test(navigator.userAgent) &&
        !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
    };
    setIsSafariMobile(checkSafariMobile());
  }, []);

  // 상세 + 북마크 상태 동시 로드
  useEffect(() => {
    if (!benefitId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const detail = await fetchJson(`/api/benefits/${benefitId}`);
        if (detail?.success && detail?.data) {
          setBenefit(detail.data);
        } else {
          throw new Error('Invalid response format');
        }

        const bookmarked = await fetchJson(`/api/benefits/bookmarks/check/${benefitId}`, {
          headers: { 'x-user-id': 'anonymous' }
        });
        if (bookmarked?.success) {
          setIsBookmarked(!!bookmarked.isBookmarked);
        } else {
          setIsBookmarked(false);
        }
      } catch (err: any) {
        console.error('상세/북마크 로드 실패:', err);
        setError(err?.message || '상세 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [benefitId]);

  const parseDetailedContent = (content: string, isFreeBenefit: boolean) => {
    if (!content) return { description: '', usageAreas: [] as string[] };
  
    const overviewMatch = content.match(/📋 혜택 개요\s*\n([\s\S]*?)(?=\n🎯|$)/);
    const overviewText = overviewMatch ? overviewMatch[1] : content;
  
    if (isFreeBenefit) {
      const parts = overviewText.split(/- (?:이용|사용) 가능 분야:/);
      let description = parts[0] ? parts[0].trim() : '';
      description = description.replace(/^.*?관광지 개요\s*-\s*주요\s*특징:\s*/g, '').trim();
      description = description.replace(/^- 지원 내용:\s*/, '').trim();
      const usageText = parts[1] ? parts[1].trim() : '';
      const usageAreas = usageText
        .split(/[.,]/)
        .map(area => area.trim())
        .filter(area => area.length > 0 && !area.includes('등에서') && !area.includes('등을'))
        .slice(0, 4);
      return {
        description,
        usageAreas: usageAreas.length > 0 ? usageAreas : ['해변 산책', '일출 감상', '사진 촬영', '바닷길 체험']
      };
    } else {
      let description = overviewText.split('- 사용 가능 분야:')[0].trim();
      description = description.replace(/^- 지원 내용:\s*/, '').trim();
      const usageMatch = overviewText.match(/- 사용 가능 분야:\s*([\s\S]*?)$/);
      const usageText = usageMatch ? usageMatch[1] : '';
      const usageAreas = usageText
        .split(/[.,]/)
        .map(area => area.trim())
        .filter(area => area.length > 0 && !area.includes('등에서') && !area.includes('등을'))
        .slice(0, 4);
      return {
        description,
        usageAreas: usageAreas.length > 0 ? usageAreas : ['교통비', '숙박비', '문화시설 이용', '관광지 입장료']
      };
    }
  };

  // 신청 자격 파싱
  const parseEligibilityDetails = (details: string) => {
    if (!details) return { age: '전 연령', income: '제한 없음', other: '제한 없음' };
    const eligibilityMatch = details.match(/🎯 신청 자격\s*\n([\s\S]*?)(?=\n🔧|$)/);
    const eligibilityText = eligibilityMatch ? eligibilityMatch[1] : details;
    const ageMatch = eligibilityText.match(/- 연령:\s*([^\n]+)/);
    const residenceMatch = eligibilityText.match(/- 거주지:\s*([^\n]+)/);
    const incomeMatch = eligibilityText.match(/- 소득[^:]*:\s*([^\n]+)/);
    return {
      age: ageMatch?.[1]?.trim() || '만 19세~39세 청년',
      income: incomeMatch?.[1]?.trim() || '소득 제한 없음',
      other: residenceMatch?.[1]?.trim() || '제한 없음'
    };
  };

  // 신청 방법 파싱
  const parseApplicationSteps = (process: string) => {
    if (!process) return [];
    const processMatch = process.match(/🔧 신청 방법\s*\n([\s\S]*?)(?=\n⚠️|$)/);
    const processText = processMatch ? processMatch[1] : process;
    const steps = processText.match(/\d+\.\s*[^:]+:[^.]*\./g) || [];
    if (steps.length === 0) {
      const basicSteps = processText
        .split(/\n/)
        .filter(line => line.trim().length > 0 && !line.includes('🔧'))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .slice(0, 4);
      return basicSteps.length > 0 ? basicSteps : [
        '운영 시간: 24시간 개방',
        '주의사항: 설명 따라 밀림 따의 해변 모습이 다르니 방문 전 올때를 확인하는 것이 좋습니다.',
        '교통편: 성산일출봉 인근에 있어 성산일출봉 입구에서 도보로 쉽게 이동'
      ];
    }
    return steps.map(step => step.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
  };

  // 주의사항 파싱
  const parseWarnings = (notes: string) => {
    if (!notes) return [] as string[];
    const warningMatch = notes.match(/⚠️ 주의 사항\s*\n([\s\S]*?)$/);
    const warningText = warningMatch ? warningMatch[1] : notes;
    const warnings = warningText.match(/[•\-]\s*[^•\-\n]+/g) || [];
    if (warnings.length === 0) {
      const basicWarnings = warningText
        .split(/[.:]\s*/)
        .filter(warning => warning.trim().length > 10)
        .slice(0, 3);
      return basicWarnings.length > 0 ? basicWarnings.map(w => w.trim()) : [
        '영수증 증빙 필수',
        '지정 업체에서만 사용 가능',
        '유효기간 확인 후 사용'
      ];
    }
    return warnings.map(warning => warning.replace(/^[•\-]\s*/, '').trim());
  };

  const handleGoBack = () => router.back();

  const handleBookmarkToggle = async () => {
    try {
      if (!isBookmarked) {
        const res = await fetchJson('/api/benefits/bookmarks', {
          method: 'POST',
          headers: { 'x-user-id': 'anonymous' },
          body: JSON.stringify({ benefit_id: benefit?.id })
        });
        if (res) setIsBookmarked(true);
      } else {
        const res = await fetchJson(`/api/benefits/bookmarks/${benefit?.id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': 'anonymous' }
        });
        if (res) setIsBookmarked(false);
      }
    } catch (err) {
      console.error('북마크 처리 중 오류:', err);
    }
  };

  const handleApply = () => {
    if (benefit?.website_url) window.open(benefit.website_url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">상세 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !benefit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => {
              // 재시도는 benefitId 의존 useEffect가 처리
              setLoading(true);
              setError(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
          >
            다시 시도
          </button>
          <button 
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const getBenefitType = () => {
    const freeTypes = ['free', 'education'];
    return freeTypes.includes(benefit?.amount_type?.toLowerCase() || '') ? 'free' : 'discount';
  };

  const benefitType = getBenefitType();
  const isFreeBenefit = benefitType === 'free';

  const { description, usageAreas } = parseDetailedContent(benefit.detailed_content, isFreeBenefit);
  const eligibilityData = parseEligibilityDetails(benefit.eligibility_details);
  const applicationSteps = parseApplicationSteps(benefit.application_process);
  const warnings = parseWarnings(benefit.important_notes);

  return (
    <>
      <div className="mobile-container bg-white" style={{ 
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Scrollable Content */}
        <div style={{
          height: isSafariMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 80px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
          overscrollBehavior: 'none',
          paddingBottom: isSafariMobile ? '20px' : '0'
        }}>
          {/* Header */}
          <div className="bg-blue-400 text-white">
            <div className="flex items-center justify-between p-4">
              <button onClick={handleGoBack} className="p-2 hover:bg-blue-500 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            {/* Hero Section */}
            <div className="text-center pb-8 px-4">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                🎯
              </div>
              <h1 className="text-2xl font-bold mb-1">{benefit.title}</h1>
              <p className="text-blue-100 text-sm mb-4">{benefit.organization}</p>
              <div className="text-xl font-bold mb-1">{benefit.amount}</div>
              <div className="text-blue-100 text-sm">{benefit.amountType}</div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* 혜택 개요 */}
            <section>
              <h2 className="flex items-center text-lg font-semibold mb-3">
                <span className="mr-2">📋</span>
                {isFreeBenefit ? '관광지 개요' : '혜택 개요'}
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-3">{isFreeBenefit ? '이용 가능 분야' : '사용 가능 분야'}</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2"> 
                  {usageAreas.map((area, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 신청 자격 */}
            <section>
              <h2 className="flex items-center text-lg font-semibold mb-3">
                <span className="mr-2">🏛️</span>
                {isFreeBenefit ? '입장 자격' : '신청 자격'}
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-sm text-gray-600 mb-1">연령 조건</div>
                  <div className="text-gray-800">{eligibilityData.age}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-sm text-gray-600 mb-1">소득 조건</div>
                  <div className="text-gray-800">{eligibilityData.income}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-sm text-gray-600 mb-1">기타 조건</div>
                  <div className="text-gray-800">{eligibilityData.other}</div>
                </div>
              </div>
            </section>

            {/* 신청 정보 */}
            <section>
              <h2 className="flex items-center text-lg font-semibold mb-3">
                <span className="mr-2">📅</span>
                {isFreeBenefit ? '입장 정보' : '신청 정보'}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">{isFreeBenefit ? '운영 시간' : '신청 기간'}</span>
                  <span className="text-gray-800 text-sm">{benefit.period || (isFreeBenefit ? '24시간' : '상시 이용 가능')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">{isFreeBenefit ? '이용 시간' : '사용 기간'}</span>
                  <span className="text-gray-800 text-sm">상시 이용 가능</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 text-sm">{isFreeBenefit ? '입장료' : '지급 방식'}</span>
                  <span className="text-gray-800 text-sm">{isFreeBenefit ? '무료' : benefit.amountType}</span>
                </div>
              </div>
            </section>

            {/* 신청 방법 */}
            {applicationSteps.length > 0 && (
              <section>
                <h2 className="flex items-center text-lg font-semibold mb-3">
                  <span className="mr-2">🔧</span>
                  {isFreeBenefit ? '이용 방법' : '신청 방법'}
                </h2>
                <div className="space-y-3">
                  {applicationSteps.map((step, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-800 mb-1">
                          {step.split(':')[0]}
                        </div>
                        {step.split(':')[1] && (
                          <div className="text-xs text-gray-600">
                            {step.split(':')[1].trim()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 주의 사항 */}
            {warnings.length > 0 && (
              <section>
                <h2 className="flex items-center text-lg font-semibold mb-3">
                  <span className="mr-2">⚠️</span>
                  주의 사항
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="font-medium text-sm text-yellow-800 mb-2">필수 확인사항</div>
                  <ul className="space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-yellow-800">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div style={{
        position: 'fixed',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '393px',
        height: '80px',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '16px',
        boxSizing: 'border-box',
        zIndex: 1000
      }}>
        <div className="flex items-center space-x-3 h-full">
          <button
            onClick={handleBookmarkToggle}
            className={`w-12 h-12 ${isBookmarked ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg flex items-center justify-center transition-colors`}
          >
            <Bookmark 
              className={`w-5 h-5 ${isBookmarked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`}
            />
          </button>
          <button
            onClick={handleApply}
            className={`flex-1 h-12 ${'bg-blue-500 hover:bg-blue-600'} text-white font-medium rounded-lg flex items-center justify-center space-x-2`}
          >
            <span>{isFreeBenefit ? '이용하기' : '신청하기'}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default BenefitDetailPage;
