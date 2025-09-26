// frontend/src/app/AI-route/components/RouteResults.tsx - 백엔드 연동 문제 해결
'use client';

import { useState } from 'react';
import { SessionManager } from '@/lib/session';

interface Place {
  id: string;
  name: string;
  type: string;
  duration: string;
  cost: number;
  description: string;
}

interface RouteRecommendation {
  id: string;
  title: string;
  duration: string;
  totalBudget: number;
  places: Place[];
  highlights: string[];
  difficulty: 'easy' | 'moderate' | 'hard';
}

interface RouteResultsProps {
  routes: RouteRecommendation[];
  onSaveRoute?: (route: RouteRecommendation) => void;
  onShareRoute?: (route: RouteRecommendation) => void;
}

// ✅ 배포/로컬 겸용 API 베이스 URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const withBase = (pathOrUrl: string) => {
  // 이미 절대 URL이면 그대로 사용
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  // '/api/..' 같은 상대 경로에 베이스만 붙여줌
  if (pathOrUrl.startsWith('/')) return `${API_BASE}${pathOrUrl}`;
  return `${API_BASE}/${pathOrUrl}`;
};

// ✅ 안전한 API 호출 함수
const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const finalUrl = withBase(url);
    console.log(`🔄 API 호출: ${finalUrl}`);
    
    const response = await fetch(finalUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`📡 응답 상태: ${response.status}`);

    const responseText = await response.text();
    console.log(`📋 응답 내용: ${responseText}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ JSON 파싱 실패:', e);
      throw new Error(`응답 파싱 실패: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('💥 API 호출 실패:', error);
    throw error;
  }
};

export default function RouteResults({ 
  routes, 
  onSaveRoute, 
  onShareRoute
}: RouteResultsProps) {
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState<string[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<string[]>([]);
  const [bookmarkLoading, setBookmarkLoading] = useState<string[]>([]);

  const toggleRouteExpansion = (routeId: string) => {
    setExpandedRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  // ✅ 실제 백엔드 API를 통한 북마크 저장/삭제 (수정된 버전)
  const toggleBookmark = async (route: RouteRecommendation) => {
    const isBookmarked = bookmarkedRoutes.includes(route.id);
    
    setBookmarkLoading(prev => [...prev, route.id]);

    try {
      const sessionId = SessionManager.getSessionId();
      console.log('📝 북마크 처리 시작:', { 
        sessionId, 
        routeId: route.id, 
        isBookmarked,
        action: isBookmarked ? 'DELETE' : 'POST' 
      });

      if (isBookmarked) {
        // ❌ 북마크 삭제 (수정된 URL과 방식)
        console.log('🗑️ 북마크 삭제 시도...');
        
        // 먼저 북마크 목록을 가져와서 실제 DB ID 확인
        const bookmarksResponse = await apiCall(`/api/bookmarks/ai-routes/${sessionId}`);
        
        if (bookmarksResponse.success && bookmarksResponse.data) {
          // route_id로 매칭되는 북마크 찾기
          const targetBookmark = bookmarksResponse.data.find((bookmark: any) => 
            bookmark.route_id === route.id || bookmark.route_data?.id === route.id
          );
          
          if (targetBookmark) {
            console.log('🎯 삭제할 북마크 찾음:', targetBookmark.id);
            
            const deleteResponse = await apiCall(`/api/bookmarks/ai-route/${targetBookmark.id}`, {
              method: 'DELETE',
              body: JSON.stringify({ sessionId }),
            });
            
            if (deleteResponse.success) {
              setBookmarkedRoutes(prev => prev.filter(id => id !== route.id));
              showToast('북마크에서 제거되었습니다', 'success');
              console.log('✅ 북마크 삭제 성공');
            } else {
              throw new Error(deleteResponse.message || '삭제 실패');
            }
          } else {
            // 이미 삭제된 경우 UI에서만 제거
            setBookmarkedRoutes(prev => prev.filter(id => id !== route.id));
            showToast('이미 삭제된 북마크입니다', 'warning');
          }
        } else {
          throw new Error('북마크 목록 조회 실패');
        }
        
      } else {
        // ✅ 북마크 저장 (올바른 데이터 구조로 수정)
        console.log('💾 북마크 저장 시도...');
        
        const routeData = {
          sessionId,
          routeData: {
            id: route.id,
            title: route.title,
            duration: route.duration,
            totalBudget: route.totalBudget,
            places: route.places.map(place => ({
              id: place.id,
              name: place.name,
              type: place.type,
              duration: place.duration,
              cost: place.cost,
              description: place.description
            })),
            highlights: route.highlights,
            difficulty: route.difficulty
          }
        };
        
        console.log('📦 전송할 데이터:', routeData);
        
        const saveResponse = await apiCall('/api/bookmarks/ai-route', {
          method: 'POST',
          body: JSON.stringify(routeData),
        });
        
        if (saveResponse.success) {
          setBookmarkedRoutes(prev => [...prev, route.id]);
          showToast('북마크에 저장되었습니다! 마이페이지에서 확인하세요', 'success');
          onSaveRoute?.(route);
          console.log('✅ 북마크 저장 성공');
        } else {
          throw new Error(saveResponse.message || '저장 실패');
        }
      }

    } catch (error: any) {
      console.error('💥 북마크 처리 실패:', error);
      
      // 에러 타입별 처리
      if (error.message?.includes('409') || error.message?.includes('이미 저장')) {
        showToast('이미 저장된 코스입니다', 'warning');
        // 이미 저장된 경우 UI를 저장된 상태로 업데이트
        setBookmarkedRoutes(prev => [...prev, route.id]);
      } else if (error.message?.includes('500')) {
        showToast('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요', 'error');
      } else if (error.message?.includes('네트워크') || error.message?.includes('Failed to fetch')) {
        showToast('네트워크 연결을 확인해주세요', 'error');
      } else {
        showToast(`오류: ${error.message}`, 'error');
      }
    } finally {
      setBookmarkLoading(prev => prev.filter(id => id !== route.id));
    }
  };

  // ✅ 향상된 토스트 메시지 표시 함수
  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
    
    // 실제 프로젝트에서는 react-hot-toast 등을 사용하는 것이 좋습니다
    console.log(`${emoji} ${message}`);
    
    // 간단한 알림 표시 (개발용)
    if (typeof window !== 'undefined') {
      // 더 나은 UX를 위해 alert 대신 사용자 정의 토스트를 만들 수 있습니다
      const toastElement = document.createElement('div');
      toastElement.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          z-index: 10000;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease;
        ">
          ${emoji} ${message}
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;
      
      document.body.appendChild(toastElement);
      
      // 3초 후 제거
      setTimeout(() => {
        toastElement.remove();
      }, 3000);
    }
  };

  const getPlaceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'attraction': return '🏛️';
      case 'food': 
      case 'restaurant': return '🍽️';
      case 'culture': return '🎭';
      case 'nature': 
      case 'park': return '🌳';
      case 'shopping': return '🛍️';
      case 'cafe': return '☕';
      default: return '📍';
    }
  };

  const getPlaceTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'attraction': return '관광명소';
      case 'food':
      case 'restaurant': return '맛집';
      case 'culture': return '문화시설';
      case 'nature':
      case 'park': return '자연명소';
      case 'shopping': return '쇼핑';
      case 'cafe': return '카페';
      default: return '기타';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'moderate': return '보통';
      case 'hard': return '어려움';
      default: return '알 수 없음';
    }
  };

  const calculateTotalBudget = (places: Place[]) => {
    return places.reduce((total, place) => total + place.cost, 0);
  };

  return (
    <div className="space-y-4">
      {routes.map((route, routeIndex) => {
        const isExpanded = expandedRoutes.includes(route.id);
        const isBookmarked = bookmarkedRoutes.includes(route.id);
        const isBookmarkLoading = bookmarkLoading.includes(route.id);
        const actualTotalBudget = calculateTotalBudget(route.places);

        return (
          <div key={route.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            
            {/* 카드 헤더 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                      코스 #{routeIndex + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white`}>
                      {getDifficultyText(route.difficulty)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold mb-1 leading-tight">{route.title}</h2>
                  
                  <div className="flex items-center gap-3 text-sm opacity-90">
                    <span>⏱️ {route.duration}</span>
                    <span>📍 {route.places.length}곳</span>
                    <span>💰 {Math.floor(actualTotalBudget/10000)}만원</span>
                  </div>
                </div>
                
                {/* 액션 버튼들 */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleBookmark(route)}
                    disabled={isBookmarkLoading}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm relative ${
                      isBookmarked 
                        ? 'bg-red-500 text-white shadow-md' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    } ${isBookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isBookmarked ? '북마크 제거' : '북마크 추가'}
                  >
                    {isBookmarkLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      isBookmarked ? '❤️' : '🤍'
                    )}
                  </button>
                  <button
                    onClick={() => onShareRoute?.(route)}
                    className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all flex items-center justify-center text-sm"
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>

            {/* 하이라이트 태그 */}
            <div className="bg-blue-50 p-3">
              <div className="flex flex-wrap gap-1">
                {route.highlights.slice(0, 5).map((highlight, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                  >
                    #{highlight}
                  </span>
                ))}
                {route.highlights.length > 5 && (
                  <span className="text-blue-500 text-xs px-2 py-1">
                    +{route.highlights.length - 5}개 더
                  </span>
                )}
              </div>
            </div>

            {/* 장소 미리보기 */}
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  🗓️ 주요 일정
                </h3>
                <span className="text-xs text-gray-500">
                  총 {route.places.length}곳
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 mb-3">
                {route.places.slice(0, 3).map((place, index) => (
                  <div key={place.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{getPlaceIcon(place.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800 truncate text-sm">{place.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 ml-2">
                          <span>{place.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                          {getPlaceTypeText(place.type)}
                        </span>
                        <span className="text-xs font-medium text-blue-600">
                          {place.cost === 0 ? '무료' : `${place.cost.toLocaleString()}원`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {route.places.length > 3 && (
                <div className="text-center">
                  <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                    외 {route.places.length - 3}곳 더 포함
                  </span>
                </div>
              )}
            </div>

            {/* 펼치기/접기 버튼 */}
            <div className="border border-gray-200 bg-white">
              <button
                onClick={() => toggleRouteExpansion(route.id)}
                className="w-full p-3 text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="font-medium text-gray-700 text-sm">
                  {isExpanded ? '간단히 보기' : '상세히 보기'}
                </span>
                <span className={`transform transition-transform text-gray-400 text-sm ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>

            {/* 상세 정보 */}
            {isExpanded && (
              <div className="border border-gray-200 bg-white">
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-gray-800 flex items-center">
                        📋 상세 일정
                      </h3>
                      <div className="text-right text-sm">
                        <div className="font-bold text-blue-600">
                          총 예산: {actualTotalBudget.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500">
                          1인 기준 • 교통비 별도
                        </div>
                      </div>
                    </div>
                    
                    {route.places.map((place, index) => (
                      <div key={place.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center relative">
                            <span className="text-base">{getPlaceIcon(place.type)}</span>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          {index < route.places.length - 1 && (
                            <div className="w-px h-4 bg-gray-300 mx-auto mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm mb-1">{place.name}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white px-2 py-0.5 rounded text-xs text-gray-600 border border-gray-200 font-medium">
                                  {getPlaceTypeText(place.type)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  소요시간: {place.duration}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm font-bold text-blue-600">
                                {place.cost === 0 ? '무료' : `${place.cost.toLocaleString()}원`}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                            {place.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-500 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200">
                                📍 위치보기
                              </button>
                              <button className="text-gray-500 text-xs font-medium px-2 py-1 rounded hover:bg-gray-50 transition-colors border border-gray-200">
                                ℹ️ 상세정보
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 하단 액션 영역 */}
            <div className="bg-white border border-gray-200 p-4">
              <div className="space-y-3">
                {/* 메인 액션 버튼 */}
                <button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all font-bold text-sm shadow-md"
                  onClick={() => {
                    showToast('이 코스를 선택하셨습니다!', 'success');
                  }}
                >
                  이 코스 선택하기 ✈️
                </button>
                
                {/* 서브 액션 버튼들 */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => toggleBookmark(route)}
                    disabled={isBookmarkLoading}
                    className={`py-2 px-3 rounded-xl transition-colors font-medium text-sm border-2 relative ${
                      isBookmarked
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    } ${isBookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isBookmarkLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                        처리중...
                      </span>
                    ) : (
                      isBookmarked ? '❤️ 저장됨' : '🤍 저장하기'
                    )}
                  </button>
                  <button 
                    onClick={() => onShareRoute?.(route)}
                    className="py-2 px-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-600"
                  >
                    📤 공유하기
                  </button>
                </div>
                
                {/* 북마크 성공 메시지 */}
                {isBookmarked && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <span className="text-green-700 text-xs font-medium">
                      ✅ 마이페이지에서 확인할 수 있어요!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
