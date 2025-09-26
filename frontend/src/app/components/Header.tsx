'use client';

import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  title?: string;
  logoSrc?: string; // 이미지 로고용
  showSearch?: boolean;
  showNotification?: boolean;
  showSettings?: boolean; // Settings 버튼 추가
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "ZeroPlay",
  logoSrc = "/logo.png", // 기본값으로 logo.png 설정
  showSearch = true,
  showNotification = true,
  showSettings = true,
  onSearchClick,
  onNotificationClick,
  onSettingsClick,
  className = ""
}) => {
  return (
    <div 
      className={`bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100 h-[70px] ${className}`}
    >
      {/* 로고 영역 */}
      <div className="flex items-center">
        <Image
          src={logoSrc}
          alt={title}
          width={128}
          height={128}
          className="h-10 w-auto"
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>
      
      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-3">
        {showSearch && (
          <button 
            onClick={onSearchClick}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="검색"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        
        {showNotification && (
          <button 
            onClick={onNotificationClick}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
          </button>
        )}

        {showSettings && (
          <button 
            onClick={onSettingsClick}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;