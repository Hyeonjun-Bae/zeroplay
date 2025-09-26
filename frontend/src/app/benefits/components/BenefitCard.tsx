'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';

interface BenefitProgram {
  id: number;
  title: string;
  organization: string;
  amount: string;
  amountType: string;
  tags: string[];
  period: string;
  age: string;
  details: string;
  category: string;
  region: string;
  type: string;
}

interface BenefitCardProps {
  program: BenefitProgram;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: number, newState: boolean) => void;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ 
  program, 
  isBookmarked: propIsBookmarked,
  onBookmarkToggle 
}) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(propIsBookmarked || false);

  // 공통 JSON fetch 유틸 (상대경로 + 기본 헤더)
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
      throw new Error(`HTTP ${res.status}: ${data?.message || res.statusText}`);
    }
    return data;
  };

  // 컴포넌트 마운트 시 북마크 상태 확인
  useEffect(() => {
    if (propIsBookmarked === undefined) {
      checkBookmarkStatus();
    } else {
      setIsBookmarked(propIsBookmarked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propIsBookmarked]);

  const checkBookmarkStatus = async () => {
    try {
      const result = await fetchJson(`/api/benefits/bookmarks/check/${program.id}`, {
        headers: { 'x-user-id': 'anonymous' }
      });
      if (result?.success) {
        setIsBookmarked(!!result.isBookmarked);
      }
    } catch (error) {
      console.error('북마크 상태 확인 실패:', error);
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 방지
    
    try {
      if (!isBookmarked) {
        // 북마크 추가
        const res = await fetchJson('/api/benefits/bookmarks', {
          method: 'POST',
          headers: { 'x-user-id': 'anonymous' },
          body: JSON.stringify({ benefit_id: program.id })
        });
        if (res) {
          setIsBookmarked(true);
          onBookmarkToggle?.(program.id, true);
        }
      } else {
        // 북마크 삭제
        const res = await fetchJson(`/api/benefits/bookmarks/${program.id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': 'anonymous' }
        });
        if (res) {
          setIsBookmarked(false);
          onBookmarkToggle?.(program.id, false);
        }
      }
    } catch (error) {
      console.error('북마크 처리 중 오류:', error);
    }
  };

  const handleCardClick = () => {
    console.log('카드 클릭:', program.id);
    router.push(`/benefits/${program.id}`);
  };

  const getAmountColor = (amountType: string) => {
    if (amountType === '무료' || amountType === 'free') {
      return 'text-green-500';
    }
    return 'text-red-500';
  };

  const getTagColor = (tag: string) => {
    const tagColors: {[key: string]: string} = {
      '신규': 'bg-green-100 text-green-700',
      '인기': 'bg-blue-100 text-blue-700',
      '여행필수': 'bg-purple-100 text-purple-700',
      '지역': 'bg-orange-100 text-orange-700',
      '자연': 'bg-green-100 text-green-700',
      '힐링': 'bg-blue-100 text-blue-700',
      '교통': 'bg-indigo-100 text-indigo-700',
      '숙박': 'bg-pink-100 text-pink-700',
      '지역특화': 'bg-yellow-100 text-yellow-700',
      '무료': 'bg-emerald-100 text-emerald-700',
      '현금지원': 'bg-red-100 text-red-700',
      '문화': 'bg-purple-100 text-purple-700',
      '정부지원': 'bg-blue-100 text-blue-700',
      '바우처': 'bg-orange-100 text-orange-700',
      '여행': 'bg-blue-100 text-blue-700'
    };
    return tagColors[tag] || 'bg-gray-100 text-gray-600';
  };

  // 지역 영어 → 한글 변환
  const getRegionKorean = (region: string) => {
    const regionMap: {[key: string]: string} = {
      'seoul': '서울',
      'capital_area': '수도권',
      'gangwon': '강원',
      'chungcheong': '충청',
      'jeolla': '전라',
      'gyeongsang': '경상',
      'jeju': '제주',
      'national': '전국'
    };
    return regionMap[region] || region;
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3 mt-1">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
              {program.title}
            </h3>
            <p className="text-sm text-gray-600 whitespace-nowrap">{program.organization}</p>
          </div>
          <div className="text-right flex-shrink-0 flex flex-col justify-center">
            <div className={`text-sm font-bold ${getAmountColor(program.amountType)} leading-tight`}>
              {program.amount}
            </div>
            <div className="text-xs text-gray-500 mt-1">{program.amountType}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {program.tags?.slice(0, 2).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className={`px-3 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
            {program.tags?.length > 2 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                +{program.tags.length - 2}
              </span>
            )}
          </div>
          
          {/* 북마크 버튼 */}
          <button
            onClick={handleBookmarkToggle}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              isBookmarked 
                ? 'bg-red-100 hover:bg-red-200' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Bookmark 
              className={`w-3 h-3 ${
                isBookmarked 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">신청기간</span>
            <span className="text-gray-700 font-medium">
              {program.period || '상시'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">대상</span>
            <span className="text-gray-700 font-medium">
              {program.age || '전체'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">지역</span>
            <span className="text-blue-600 font-medium">
              {getRegionKorean(program.region) || '전국'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;
