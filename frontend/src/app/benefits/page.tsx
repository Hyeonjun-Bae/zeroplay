'use client'

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavBar from '../components/NavBar';
import CategoryTabs from '@/app/benefits/components/CategoryTabs';
import BenefitCard from '@/app/benefits/components/BenefitCard';

interface BenefitProgram {
  id: number;
  title: string;
  organization: string;
  amount: string;
  amountType: string;
  amount_type?: string;
  tags: string[];
  period: string;
  age: string;
  details: string;
  category: string;
  region: string;
  type: string;
}

const YouthBenefitsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('전체');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [isSafariMobile, setIsSafariMobile] = useState(false);
  
  const [allPrograms, setAllPrograms] = useState<BenefitProgram[]>([]);
  const [programs, setPrograms] = useState<BenefitProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [NavActiveTab, setNavActiveTab] = useState('혜택 정보');

  // 탭별로 다른 지역 옵션 반환
  const getRegionOptions = () => {
    const baseRegions = ['서울', '수도권', '강원', '충청', '전라', '경상', '제주'];
    return ['전체', ...baseRegions];
  };

  const regions = getRegionOptions();

  // 탭 변경 시 지역 초기화
  useEffect(() => {
    if (activeTab === '무료' && selectedRegion === '전국') {
      setSelectedRegion('전체');
    }
  }, [activeTab]);

  // ✅ 공용: JSON fetch 유틸 (상대경로 + 에러로그)
  const fetchJson = async (url: string, init?: RequestInit) => {
    console.log('[API] 요청:', url);
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      ...init,
    });
    console.log('[API] 상태:', res.status);

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.error('[API] JSON 파싱 실패 원문:', text);
      throw new Error(`응답 파싱 실패: ${text}`);
    }

    if (!res.ok) {
      console.error('[API] 에러응답:', data);
      const msg = data?.message || res.statusText;
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    return data;
  };

  // 전체 데이터는 한 번만 로드
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log('fetchAllData 시작');
        const result = await fetchJson('/api/benefits');
        console.log('fetchAllData 결과:', result);
        
        if (result.success && result.data) {
          const transformedData = result.data.map((item: any) => ({
            ...item,
            amountType: item.amountType || '혜택'
          }));
          setAllPrograms(transformedData);
        }
      } catch (error) {
        console.error('fetchAllData 실패:', error);
      }
    };
    
    const checkSafariMobile = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && 
        /Safari/.test(navigator.userAgent) && 
        !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
    };
    
    setIsSafariMobile(checkSafariMobile());
    fetchAllData();
  }, []);

  // 필터링된 데이터는 필터 변경시마다
  useEffect(() => {
    fetchBenefits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, activeTab]);

  const fetchBenefits = async () => {
    try {
      console.log('fetchBenefits 시작 - 탭:', activeTab, '지역:', selectedRegion);
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedRegion !== '전체') params.append('region', selectedRegion);
      if (activeTab !== '전체') params.append('type', activeTab);
      
      const url = `/api/benefits${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('요청 URL:', url);
      
      const result = await fetchJson(url);
      console.log('받은 데이터:', result);
      
      if (result.success && result.data) {
        const transformedData = result.data.map((item: any) => ({
          ...item,
          amountType: item.amountType || '혜택'
        }));
        
        console.log('변환된 데이터:', transformedData);
        console.log('첫 번째 항목 amountType:', transformedData[0]?.amountType);
        setPrograms(transformedData);
      } else {
        console.error('잘못된 응답 형식:', result);
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('fetchBenefits 에러 상세:', error);
      setError(`데이터를 불러오는데 실패했습니다: ${error.message || error}`);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab: string) => {
    console.log('탭 변경:', newTab);
    setActiveTab(newTab);
    if (newTab === '무료' && selectedRegion === '전국') {
      setSelectedRegion('전체');
    } else {
      setSelectedRegion('전체');
    }
  };

  const handleRegionChange = (region: string) => {
    console.log('지역 선택:', region);
    setSelectedRegion(region);
    setShowRegionDropdown(false);
  };

  const currentPrograms = programs;

  // 수정된 지역별 개수 계산 함수 - 현재 탭을 고려
  const getRegionCount = (region: string): number => {
    if (!allPrograms.length) return 0;
    
    let filteredPrograms = allPrograms;
    if (activeTab === '무료') {
      filteredPrograms = allPrograms.filter(p => p.type === 'free' || p.amountType === '무료');
    } else if (activeTab === '혜택') {
      filteredPrograms = allPrograms.filter(p => p.type === 'discount' || (p.amountType !== '무료' && p.amountType !== 'free'));
    }
    
    if (region === '전체') return filteredPrograms.length;
    
    if (region === '전국') {
      return filteredPrograms.filter(p => 
        p.region === '전국' || p.region === 'national' || !p.region || p.region === '전체'
      ).length;
    }
    
    const regionMapping: {[key: string]: string[]} = {
      '서울': ['seoul', '서울'],
      '수도권': ['capital_area', 'incheon', 'gyeonggi', '수도권'],
      '강원': ['gangwon', '강원'],
      '충청': ['chungcheong', '충청'],
      '전라': ['jeolla', '전라'],
      '경상': ['gyeongsang', '경상'],
      '제주': ['jeju', '제주']
    };
    
    const possibleRegions = regionMapping[region] || [region];
    return filteredPrograms.filter(p => possibleRegions.includes(p.region)).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">혜택 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && programs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={fetchBenefits}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 - 상단 고정 */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '393px', height: '70px', zIndex: 1000, background: 'white' }}>
        <Header />
      </div>

      {/* 카테고리 탭 - 고정 위치 */}
      <div style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', width: '393px', height: '50px', zIndex: 999, background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <CategoryTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* 지역 선택 드롭다운 - 고정 위치 */}
      <div style={{ position: 'fixed', top: '120px', left: '50%', transform: 'translateX(-50%)', width: '393px', height: '60px', zIndex: 998, background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div className="px-4 py-3 flex justify-center">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">📍</span>
                <span className="text-sm font-semibold">{selectedRegion}</span>
                <span className="text-xs text-gray-500">({currentPrograms.length}개)</span>
              </div>
              <span className={`text-gray-400 text-xs transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showRegionDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRegionDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => handleRegionChange(region)}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        selectedRegion === region ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <span>{region}</span>
                      <span className="text-xs text-gray-500">{getRegionCount(region)}개</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 - 네비바까지 꽉 채움 */}
      <div 
        className="overflow-y-auto bg-gray-50" 
        style={{ 
          position: 'fixed',
          top: '180px',
          bottom: '70px', 
          left: '50%',
          transform: 'translateX(-50%)',
          width: '393px'
        }}
      >
        <div className="px-4 py-6 space-y-3">
          {currentPrograms.map((program) => (
            <BenefitCard key={program.id} program={program} />
          ))}

          {currentPrograms.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">혜택이 없습니다</h3>
              <p className="text-gray-500 text-sm mb-4">
                <strong>{selectedRegion}</strong>에서 이용 가능한 <strong>{activeTab === '전체' ? '전체' : activeTab}</strong> 프로그램이 없습니다.
              </p>
              <button
                onClick={() => {
                  setSelectedRegion('전체');
                  setActiveTab('전체');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                전체 혜택 보기
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 네비바 - 기존 위치에 그대로 고정 */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '393px', height: '70px', zIndex: 1000 }}>
        <BottomNavBar 
          activeTab={NavActiveTab}
          onTabChange={setNavActiveTab}
        />
      </div>
    </>
  );
};

export default YouthBenefitsPage;
