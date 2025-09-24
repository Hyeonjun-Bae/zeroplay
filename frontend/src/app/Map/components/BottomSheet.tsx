'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, MapPin, ChevronDown } from 'lucide-react';
import { LocalSpot, CATEGORY_MAP_REVERSE } from '../lib/api';
import { toggleBookmark, isBookmarked } from '../utils/bookmarkUtils';
import SpotListItem from './SpotListItem';
import SpotDetailView from './SpotDetailView';
import SortDropdown, { SortOption } from './SortDropdown';
import { LocalDeal, DUMMY_LOCAL_DEALS, hasLocalDeal, getLocalDealForSpot } from './LocalDealsData';
import { getCategoryIcon, getCategoryName } from './CategoryHelper';

// 거리 계산 함수 (Haversine formula)
const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 스팟 정렬 함수
const sortSpots = (
  spots: LocalSpot[], 
  sortBy: SortOption, 
  userLocation?: { lat: number; lng: number } | null
): LocalSpot[] => {
  const sortedSpots = [...spots];

  switch (sortBy) {
    case 'recommended':
      return sortedSpots.sort((a, b) => {
        const aHasLocalDeal = DUMMY_LOCAL_DEALS.some(deal => deal.spot_id === a.id && deal.is_active);
        const bHasLocalDeal = DUMMY_LOCAL_DEALS.some(deal => deal.spot_id === b.id && deal.is_active);
        
        const aScore = (a.rating || 0) * 0.6 + 
                      Math.log(Math.max(a.review_count || 1, 1)) * 0.3 +
                      (aHasLocalDeal ? 0.5 : 0);
        const bScore = (b.rating || 0) * 0.6 + 
                      Math.log(Math.max(b.review_count || 1, 1)) * 0.3 +
                      (bHasLocalDeal ? 0.5 : 0);
        return bScore - aScore;
      });

    case 'distance':
      if (!userLocation) return sortedSpots;
      
      return sortedSpots.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          a.latitude, 
          a.longitude
        );
        const distanceB = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          b.latitude, 
          b.longitude
        );
        return distanceA - distanceB;
      });

    case 'rating':
      return sortedSpots.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        if (ratingA === ratingB) {
          return (b.review_count || 0) - (a.review_count || 0);
        }
        return ratingB - ratingA;
      });

    default:
      return sortedSpots;
  }
};

// 거리 포맷 함수
const formatDistance = (
  userLocation: { lat: number; lng: number } | null,
  spot: LocalSpot
): string => {
  if (!userLocation) return '';
  
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    spot.latitude,
    spot.longitude
  );
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};

// Props 인터페이스
interface BottomSheetProps {
  showBottomSheet: boolean;
  setShowBottomSheet: (show: boolean) => void;
  bottomSheetHeight: number;
  setBottomSheetHeight: (height: number) => void;
  activeCategory: string;
  showLocalDeals: boolean;
  handleDragStart: (clientY: number) => void;
  isDragging: boolean;
  startY: number;
  startHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  spots: LocalSpot[];
  loading?: boolean;
  selectedSpot?: LocalSpot | null;
  onBackToList?: () => void;
  onSpotClick?: (spot: LocalSpot) => void;
}

const generateTempUserId = (): string => {
    if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const getUserId = (): string => {
    if (typeof window === 'undefined') return '00000000-0000-4000-8000-000000000000';
    
    let userId = localStorage.getItem('temp_user_id');
    if (!userId) {
      userId = generateTempUserId();
      localStorage.setItem('temp_user_id', userId);
    }
    return userId;
  };

const BottomSheet: React.FC<BottomSheetProps> = ({
  showBottomSheet,
  setShowBottomSheet,
  bottomSheetHeight,
  setBottomSheetHeight,
  activeCategory,
  showLocalDeals,
  handleDragStart,
  isDragging,
  startY,
  startHeight,
  containerRef,
  spots,
  loading = false,
  selectedSpot = null,
  onBackToList,
  onSpotClick,
}) => {
  // State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookmarkStatuses, setBookmarkStatuses] = useState<Record<string, boolean>>({});
  const [bookmarkLoading, setBookmarkLoading] = useState(true);
  
  // 정렬 관련 State
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  
  // 쿠폰 받기 상태 관리
  const [receivedCoupons, setReceivedCoupons] = useState<Set<string>>(new Set());
  
  const userId = getUserId();


  // 현재 위치 가져오기
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('위치 정보를 가져올 수 없습니다:', error);
        }
      );
    }
  }, []);

  // 표시할 데이터 계산 (메모이제이션)
  const displayData = useMemo((): LocalSpot[] => {
    if (showLocalDeals) {
      const localDealSpots = spots.filter(spot => hasLocalDeal(spot.id));
      console.log('🎟️ 로컬딜 보유 스팟:', localDealSpots.length, '개');
      return localDealSpots;
    } else if (activeCategory === '전체') {
      return spots;
    } else {
      const categoryKey = {
        '체험': 'experience',
        '문화': 'culture',
        '맛집': 'restaurant',
        '카페': 'cafe'
      }[activeCategory] as keyof typeof CATEGORY_MAP_REVERSE;
      
      if (categoryKey) {
        return spots.filter(spot => spot.category === categoryKey);
      }
      return spots;
    }
  }, [spots, showLocalDeals, activeCategory]);

  // 정렬된 데이터 계산
  const sortedDisplayData = useMemo((): LocalSpot[] => {
    return sortSpots(displayData, sortBy, userLocation);
  }, [displayData, sortBy, userLocation]);

  // 북마크 상태 일괄 조회
  useEffect(() => {
    const loadBookmarkStatuses = async () => {
      if (sortedDisplayData.length === 0) {
        setBookmarkLoading(false);
        return;
      }
      
      try {
        setBookmarkLoading(true);
        
        // 모든 스팟의 북마크 상태를 병렬로 조회
        const statusPromises = sortedDisplayData.map(async (spot) => {
          try {
            const result = await isBookmarked(userId, spot.id, 'spot');
            return { 
              id: spot.id, 
              isBookmarked: result.success ? (result.isBookmarked || false) : false 
            };
          } catch (error) {
            console.warn(`북마크 상태 조회 실패 (${spot.id}):`, error);
            return { id: spot.id, isBookmarked: false };
          }
        });
        
        const results = await Promise.all(statusPromises);
        const statusMap: Record<string, boolean> = {};
        results.forEach(({ id, isBookmarked }) => {
          statusMap[id] = isBookmarked;
        });
        setBookmarkStatuses(statusMap);
        
      } catch (error) {
        console.error('북마크 상태 일괄 조회 실패:', error);
        // 실패 시 모든 항목을 false로 설정
        const fallbackStatuses: Record<string, boolean> = {};
        sortedDisplayData.forEach(spot => {
          fallbackStatuses[spot.id] = false;
        });
        setBookmarkStatuses(fallbackStatuses);
      } finally {
        setBookmarkLoading(false);
      }
    };

    loadBookmarkStatuses();
  }, [sortedDisplayData, userId]);

  // 북마크 토글 핸들러
  const handleBookmarkToggle = async (spotId: string, currentStatus: boolean) => {
    try {
      // UI 즉시 업데이트 (낙관적 업데이트)
      setBookmarkStatuses(prev => ({
        ...prev,
        [spotId]: !currentStatus
      }));

      // 실제 API 호출
      const result = await toggleBookmark(userId, spotId, 'spot');
      
      if (result.success) {
        // API 응답으로 실제 상태 업데이트
        setBookmarkStatuses(prev => ({
          ...prev,
          [spotId]: result.isBookmarked || false
        }));
      } else {
        // 실패 시 UI 되돌리기
        setBookmarkStatuses(prev => ({
          ...prev,
          [spotId]: currentStatus
        }));
        console.error('북마크 토글 실패:', result.error);
      }
      
    } catch (error) {
      console.error('북마크 토글 실패:', error);
      // 실패 시 UI 되돌리기
      setBookmarkStatuses(prev => ({
        ...prev,
        [spotId]: currentStatus
      }));
    }
  };


  // 로컬딜 쿠폰 받기
  const handleGetCoupon = (deal: LocalDeal) => {
    // 이미 받은 쿠폰인지 확인
    if (receivedCoupons.has(deal.id)) {
      alert('이미 받은 쿠폰입니다! 🎟️');
      return;
    }

    // 쿠폰 받기 처리
    setReceivedCoupons(prev => new Set([...prev, deal.id]));
    alert(`${deal.title} 쿠폰을 받았습니다! 🎉`);
    
    // 실제로는 쿠폰 저장 API 호출
    console.log('🎟️ 쿠폰 발급:', deal);
  };

  // 이미지 네비게이션
  const goToPrevImage = () => {
    if (!selectedSpot?.images) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? selectedSpot.images!.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    if (!selectedSpot?.images) return;
    setCurrentImageIndex(prev => 
      prev === selectedSpot.images!.length - 1 ? 0 : prev + 1
    );
  };

  // 터치 이벤트
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const screenHeight = window.innerHeight || 852;
    const maxHeight = Math.min(screenHeight * 0.8, 680);
    const minHeight = 120;
    
    const deltaY = startY - e.touches[0].clientY;
    const newHeight = Math.min(Math.max(startHeight + deltaY, minHeight), maxHeight);
    setBottomSheetHeight(newHeight);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  // 리스트 모드 렌더링
  const renderListMode = () => {
    const titleText = showLocalDeals ? '로컬딜 가게 목록' : `${activeCategory} 목록`;

    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="px-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {titleText}
            </h3>
            
            {/* 정렬 드롭다운 */}
            <div className="mt-1">
              <SortDropdown 
                currentSort={sortBy}
                onSortChange={setSortBy}
                userLocation={userLocation}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span>{sortedDisplayData.length}개의 장소</span>
            {showLocalDeals && (
              <span className="text-green-600 font-medium">🎟️ 쿠폰 제공</span>
            )}
            {(loading || bookmarkLoading) && (
              <div className="flex items-center space-x-1">
                <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>{loading ? '로딩중' : '북마크 로딩중'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 스팟 리스트 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {sortedDisplayData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <MapPin className="w-8 h-8 mb-2" />
              <p className="text-sm">
                {showLocalDeals ? '로컬딜을 제공하는 가게가 없습니다' : '해당 카테고리의 스팟이 없습니다'}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {sortedDisplayData.map((spot: LocalSpot, index) => {
                const spotDeal = getLocalDealForSpot(spot.id);
                const distance = userLocation ? formatDistance(userLocation, spot) : '';
                
                return (
                  <SpotListItem
                    key={spot.id}
                    spot={spot}
                    index={index}
                    sortBy={sortBy}
                    userLocation={userLocation}
                    spotDeal={spotDeal}
                    distance={distance}
                    operatingHours={spot.operating_hours}
                    bookmarkStatuses={bookmarkStatuses}
                    bookmarkLoading={bookmarkLoading}
                    onSpotClick={onSpotClick}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };



  if (!showBottomSheet) return null;

  const DRAG_HANDLE_HEIGHT = 12;
  const contentHeight = bottomSheetHeight - DRAG_HANDLE_HEIGHT;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-all duration-300 ease-out z-20 ${
        showBottomSheet ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ height: `${bottomSheetHeight}px` }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 드래그 핸들 */}
      <div 
        className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
        style={{ height: `${DRAG_HANDLE_HEIGHT}px` }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleDragStart(e.clientY);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          if (e.touches.length === 1) {
            handleDragStart(e.touches[0].clientY);
          }
        }}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>

      {/* 콘텐츠 */}
      <div 
          className="overflow-hidden"
          style={{ height: `${contentHeight}px` }}
        >
          {selectedSpot ? (
            <SpotDetailView
              spot={selectedSpot}
              currentImageIndex={currentImageIndex}
              onPrevImage={goToPrevImage}
              onNextImage={goToNextImage}
              onBackToList={onBackToList}
              bookmarkStatuses={bookmarkStatuses}
              bookmarkLoading={bookmarkLoading}
              onBookmarkToggle={handleBookmarkToggle}
              localDeals={DUMMY_LOCAL_DEALS}
              receivedCoupons={receivedCoupons}
              onReceiveCoupon={handleGetCoupon}
            />
          ) : (
            renderListMode()
          )}
      </div>
    </div>
  );
};

export default BottomSheet;