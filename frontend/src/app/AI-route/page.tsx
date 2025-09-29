'use client';

import { useState, useEffect } from 'react';
import AppContainer from './components/AppContainer';
import BottomNavigation from './components/BottomNavigation';
import FilterButtons from './components/FilterButtons';
import ChatBot from './components/ChatBot';
import RouteResults from './components/RouteResults';
import Header from '../components/Header';
import BottomNavBar from '../components/NavBar';

export interface FilterState {
  budget: string;
  duration: string;
  companions: string;
  interests: string[];
  region: string;
}

export interface RouteRecommendation {
  id: string;
  title: string;
  duration: string;
  totalBudget: number;
  places: Array<{
    id: string;
    name: string;
    type: string;
    duration: string;
    cost: number;
    description: string;
  }>;
  highlights: string[];
  difficulty: 'easy' | 'moderate' | 'hard';
}

type MobileTab = 'chat' | 'filters' | 'results';

export default function AIRoutePage() {
  const [filters, setFilters] = useState<FilterState>({
    budget: '',
    duration: '',
    companions: '',
    interests: [],
    region: ''
  });

  const [currentRoutes, setCurrentRoutes] = useState<RouteRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<MobileTab>('filters');
  const [navActiveTab, setNavActiveTab] = useState('AI 루트');

  useEffect(() => {
    if (currentRoutes.length > 0) {
      setActiveTab('results');
    }
  }, [currentRoutes.length]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleRouteGenerated = (routeData: any) => {
    const newRoute: RouteRecommendation = {
      id: routeData.id.toString(),
      title: routeData.title,
      duration: routeData.duration,
      totalBudget: routeData.totalBudget || 100000,
      places: routeData.places.map((place: any, index: number) => ({
        id: (index + 1).toString(),
        name: place.name,
        type: place.type,
        duration: place.duration,
        cost: place.cost || 20000,
        description: place.description || `${place.name}에서 즐기는 특별한 시간`
      })),
      highlights: routeData.highlights || ['힐링', '맛집', '관광'],
      difficulty: routeData.difficulty || 'easy'
    };

    setCurrentRoutes(prev => [...prev, newRoute]);
  };

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 max-w-[393px] mx-auto relative">
      {/* 🔥 공통 헤더 */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] z-50">
        <Header 
          title="mySUBWAY"
          showSearch={false}
          onNotificationClick={() => console.log('알림 클릭')}
          onSettingsClick={() => console.log('설정 클릭')}
          className="h-[60px] border-b border-gray-100"
        />
      </div>

      {/* 🔥 메인 콘텐츠 - 정확한 높이 계산 */}
      <div 
        className="bg-white flex flex-col"
        style={{ 
          marginTop: '60px',
          // 🔥 수정: AI 네비(60px) + 공통 네비(70px) = 130px
          marginBottom: '130px',
          minHeight: 'calc(100vh - 190px)',
          maxWidth: '393px'
        }}
      >
        {/* AI 루트 추천 헤더 */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">🤖</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AI 여행 추천</h1>
                <p className="text-xs text-gray-500">맞춤 여행 코스 생성</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 메인 콘텐츠 영역 - 높이 재계산 */}
        <div 
          className="flex-1 overflow-hidden bg-gray-50"
          style={{ 
            // 🔥 수정: 전체화면 - 헤더(60px) - AI헤더(60px) - 두 네비바(130px) = 정확한 높이
            height: 'calc(100vh - 250px)'
          }}
        >
          
          {/* 필터 탭 */}
          {activeTab === 'filters' && (
            <div className="h-full overflow-auto">
              <div className="p-4 space-y-4 pb-6">
                
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                      <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2 text-sm">
                        ⚙️
                      </span>
                      여행 조건 설정
                    </h2>
                    {activeFiltersCount > 0 && (
                      <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    원하는 여행 스타일을 선택하면 AI가 맞춤 코스를 추천해드려요
                  </p>
                </div>

                <div className="bg-white px-3 py-3 rounded-2xl shadow-sm border border-gray-200">
                  <FilterButtons 
                    filters={filters} 
                    onFilterChange={handleFilterChange}
                  />
                </div>

                {activeFiltersCount > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="w-full bg-gradient-to-r bg-blue-500 text-white py-4 px-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                    >
                      조건 적용하고 AI 추천받기 ✨
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 채팅 탭 */}
          {activeTab === 'chat' && (
            <div className="h-full bg-white flex flex-col">
              <div className="bg-blue-50 px-4 py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-blue-700">AI 여행 추천</span>
                </div>
              </div>
              
              {/* 🔥 ChatBot 컴포넌트에 적절한 높이 제공 */}
              <div className="flex-1 relative">
                <ChatBot 
                  onRouteGenerated={handleRouteGenerated} 
                  filters={filters}
                />
              </div>
            </div>
          )}

          {/* 결과 탭 */}
          {activeTab === 'results' && (
            <div className="h-full overflow-auto">
              <div className="p-4 pb-6">
                {currentRoutes.length > 0 ? (
                  <div className="space-y-4">
                    
                    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-green-600 text-lg">🗺️</span>
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-gray-900">추천 코스</h2>
                            <p className="text-sm text-gray-600">
                              {currentRoutes.length}개의 맞춤 여행 코스
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('chat')}
                          className="bg-blue-50 text-blue-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          + 새 코스
                        </button>
                      </div>
                    </div>

                    <RouteResults routes={currentRoutes} />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-200">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl text-gray-400">🗺️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">아직 추천 코스가 없어요</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      AI와 대화하여<br />맞춤 여행 코스를 만들어보세요!
                    </p>
                    <button
                      onClick={() => setActiveTab('filters')}
                      className="bg-gradient-to-r bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95"
                    >
                      여행 조건 설정하기 🚀
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 AI 루트 전용 네비게이션 - 공통 네비 위에 위치, 높이 60px */}
      <div className="fixed bottom-[70px] left-1/2 transform -translate-x-1/2 w-full max-w-[393px] z-40 bg-white">
        <div className="h-[60px]">
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeFiltersCount={activeFiltersCount}
            resultsCount={currentRoutes.length}
          />
        </div>
      </div>

      {/* 🔥 공통 하단 네비게이션 - 최하단 위치, 높이 70px */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] z-50">
        <BottomNavBar
          activeTab={navActiveTab}
          onTabChange={setNavActiveTab}
        />
      </div>
    </div>
  );
}