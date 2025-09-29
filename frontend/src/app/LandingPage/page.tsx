// app/page.tsx - Next.js용 랜딩페이지
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    // 부드러운 스크롤
    const handleAnchorClick = (e: Event) => {
    const target = e.target as HTMLAnchorElement;
    const href = target.getAttribute('href');
    if (href?.startsWith('#')) {
        e.preventDefault();
        const targetId = href.slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        }
    }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    // 스크롤 애니메이션
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // 숫자 카운트 애니메이션
    const animateNumbers = () => {
      const stats = document.querySelectorAll('.stat-number');
      
      stats.forEach(stat => {
        const targetAttr = stat.getAttribute('data-target');
        const target = targetAttr ? parseInt(targetAttr) : 0;
        const increment = target / 60;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          stat.textContent = Math.floor(current).toString();
        }, 50);
      });
    };

    // 통계 섹션 관찰
    const statsSection = document.querySelector('.stats-section');
    let statsAnimated = false;

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          animateNumbers();
          statsAnimated = true;
        }
      });
    }, { threshold: 0.5 });

    if (statsSection) {
      statsObserver.observe(statsSection);
    }

    // 헤더 스크롤 효과
    let lastScrollTop = 0;
    const header = document.querySelector('.header') as HTMLElement;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener('scroll', handleScroll);

    // 페이지 로드 완료 애니메이션
    document.body.classList.add('loaded');

    return () => {
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (statsSection) {
        statsObserver.unobserve(statsSection);
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="header-content max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="#" className="flex items-center">
            <div className="Logo"><Image src="/Logo.png" alt="로고" width={70} height={50} style={{ width: 'auto', height: 'auto' }}/>
            </div>
          </Link>
          <nav className="header-nav hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-blue-400 transition-colors">미리보기</Link>
            <Link href="#demo" className="text-gray-700 hover:text-blue-400 transition-colors">기능</Link>
            <Link href="#benefits" className="text-gray-700 hover:text-blue-400 transition-colors">다운로드</Link>
            <Link href="/" className="download-btn bg-blue-900 text-white px-6 py-2 rounded-full hover:bg-blue-900">바로가기</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden bg-blue-50">
        <div className="hero-bg absolute inset-0"></div>
        <div className="hero-content relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="hero-badge inline-block bg-white/80 backdrop-blur-sm border border-blue-900 rounded-full px-6 py-2 text-sm text-gray-700 mb-6">
            부담을 덜고, 온전한 나를 채우다
          </div>
          <h1 className="hero-title text-1xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-900 to-blue-300 bg-clip-text text-transparent">
            청년 맞춤형 여행 플랫폼
            <Image src="/Logo.png" alt="로고" width={350} height={100}  className="-ml-7"style={{ width: 'auto', height: 'auto' }}/>
          </h1>
          <p className="hero-subtitle text-xl text-gray-600 mb-4">청년들을 위한 특별한 로컬 여행의 시작</p>
          <p className="hero-description text-gray-500 mb-12 max-w-2xl mx-auto">
            AI가 제안하는 특별한 여정,<br />
            청년 혜택과 로컬딜로 더 스마트하게.
          </p>
          <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="cta-primary bg-blue-900 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg">
              ✨ 서비스 체험하기
            </Link>
            <Link href="#features" className="cta-secondary bg-white border-2 border-blue-900 text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
              📖 더 알아보기
            </Link>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section id="features" className="section py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="section-header fade-in text-center mb-16">
            <div className="section-badge inline-block bg-blue-50 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              계획부터 출발까지
            </div>
            <h2 className="section-title text-4xl font-bold mb-6 leading-snug">
              번거로움은 덜고, <br /> 여행의 설렘은 더 크게.
            </h2>
            <p className="section-subtitle text-xl text-gray-600 max-w-3xl mx-auto tracking-normal">
              고민하고, 선택하고, 출발하는 순간까지. 여행의 모든 과정에 <b>ZeroPlay</b>가 함께합니다.
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "AI 맞춤 코스 추천",
                description: "사용자의 취향과 데이터를 분석해 개인 맞춤형 여행 코스를 제안합니다. 숨겨진 로컬 스팟을 우선적으로 추천해 새로운 경험을 선물합니다."
              },
              {
                icon: "🏃‍♂️",
                title: "청년 맞춤 혜택 정보 제공",
                description: "청년 문화패스, KTX 할인, 지역화폐 등 청년들에게 실질적으로 도움이 되는 혜택을 한 곳에서 확인하세요."
                
              },
              {
                icon: "🗺️",
                title: "인터랙티브 지도",
                description: "체험, 문화공간, 맛집을 카테고리별로 한눈에 보고 북마크할 수 있습니다. 현재 위치 기준 가까운 스팟도 쉽게 찾을 수 있어요."
              },
              {
                icon: "💸",
                title: "실시간 로컬딜 정보",
                description: "비는 시간, 당일 소진해야 하는 음식 등 잉여 자원을 활용해 할인 혜택을 제공합니다. 여행자는 합리적인 가격으로 즐기고, 사장님은 손실을 줄여 모두가 만족하는 여행이 됩니다."
              },
              {
                icon: "🔖",
                title: "개인화된 북마크",
                description: "마음에 드는 장소를 북마크하고 나만의 여행 노트를 채워가세요. 특별한 순간을 모아두고, 친구들과 추억을 나눌 수도 있습니다."
              },
              {
                icon: "📱",
                title: "모바일 최적화",
                description: "393×852 모바일 화면에 맞춘 UI로 언제 어디서나 편리하게 로컬 정보를 확인하고 여행을 계획할 수 있습니다."
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card fade-in bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="feature-icon text-4xl mb-4">{feature.icon}</div>
                <h3 className="feature-title text-xl font-bold mb-4">{feature.title}</h3>
                <p className="feature-description text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features_AI Section */}
      <section id="demo" className="demo-section py-20 bg-blue-50">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="demo-container flex flex-col lg:flex-row items-center gap-16">
            
            {/* 좌측 이미지 영역 */}
            <div className="demo-image fade-in flex-1 mr-10">
              <div className="AI"><Image src="/AI.png" alt="로고" width={500
              } height={50} style={{ width: 'auto', height: 'auto' }}/>
              </div>
            </div>

            {/* 우측 텍스트 영역 */}
            <div className="demo-content fade-in flex-1 px-4 mb-13">
              <div className="section-badge inline-block bg-white/80 text-blue-900 border border-blue-900 px-6 py-2 rounded-full text-sm font-medium mb-6">
                어떤 취향이든, 다 맞춰주니까
              </div>
              <h2 className="demo-title text-4xl font-bold mb-6 leading-snug">
                어떤 여행 취향이든<br />간단히 알려주세요
              </h2>
              <p className="demo-description text-lg text-gray-600 mb-8">
                AI는 여러분의 취향에 꼭 맞는 일정을 추천해 드립니다.<br /> 
                여행 전이든 여행 중이든 계획한 일정을 간편하게 수정하고 꺼내보세요.
              </p>
              <ul className="feature-list space-y-3">
                {["자연과 함께 여유롭게 힐링", "체험·액티비티 중심", "유명 관광지 필수 코스", "맛집 탐방 위주"].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-900 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features_Benefits Section */}
      <section id="demo" className="demo-section py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="demo-container flex flex-col lg:flex-row items-center gap-16">
            
            {/* 좌측 텍스트 영역 */}
            <div className="demo-content fade-in flex-1 px-4 mb-10">
              <div className="section-badge inline-block bg-blue-50 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                혜택까지 챙기는 똑똑한 여행
              </div>
              <h2 className="demo-title text-4xl font-bold mb-6 leading-snug">
                여행에 필요한 혜택 정보,<br /> 한눈에 확인하세요
              </h2>
              <p className="demo-description text-lg text-gray-600 mb-8">
                교통비부터 숙박, 문화 할인까지 <br />
                청년들에게 실질적으로 도움이 되는 혜택을 한눈에 보여드립니다.<br /> 
                여행을 더 가볍게, 더 풍성하게 만들어보세요.
              </p>
              <ul className="feature-list space-y-3">
                {["KTX·버스 등 교통 할인", "숙박 지원·지역화폐", "문화패스·체험 할인", "지역 소상공인 특가"].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-900 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 우측 이미지 영역 */}
            <div className="demo-image fade-in flex-1">
              <div className="AI"><Image src="/Benefits.png" alt="로고" width={500
              } height={50} style={{ width: 'auto', height: 'auto' }}/>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features_Map Section */}
      <section id="demo" className="demo-section py-20 bg-blue-50">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="demo-container flex flex-col lg:flex-row items-center gap-16">
            
            {/* 좌측 이미지 영역 */}
            <div className="demo-image fade-in flex-1 mr-10">
              <div className="AI"><Image src="/Map.png" alt="로고" width={500
              } height={50} style={{ width: 'auto', height: 'auto' }}/>
              </div>
            </div>

            {/* 우측 텍스트 영역 */}
            <div className="demo-content fade-in flex-1 px-4 py-10 mb-10">
              <div className="section-badge inline-block bg-white/80 text-blue-900 border border-blue-900 px-6 py-2 rounded-full text-sm font-medium mb-6">
                여행의 길 위에서 만나는 혜택
              </div>
              <h2 className="demo-title text-4xl font-bold mb-6 leading-snug">
                스팟도 찾고, 혜택도 챙기세요
              </h2>
              <p className="demo-description text-lg text-gray-600 mb-8">
                맛집, 문화 공간, 체험 프로그램은 물론, 오늘만 가능한 로컬딜까지.<br /> 
                여행자는 저렴하게, 사장님은 손실 없이 — <br />
                모두가 만족하는 여행을 경험하세요.
              </p>
              <ul className="feature-list space-y-3">
                {["공방·원데이 클래스 체험", "독립서점·전시 공간 문화·예술", "로컬 맛집·카페", "실시간 로컬딜 특가"].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-900 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-20 bg-blue-900 text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <div className="fade-in">
            <h2 className="cta-title text-xl md:text-xl font-bold">
            청년 맞춤형 여행 플랫폼
            </h2>
            <h2 className="cta-title text-4xl md:text-7xl font-bold mb-6">
            ZeroPlay
            </h2>
            <p className="cta-subtitle text-xl mb-12">지금 바로 다운로드하고 여행을 떠나세요!</p>
            
            <div className="app-badges flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="#" className="app-badge bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition-colors">
                📱 앱 다운로드
              </Link>
              <Link href="/" className="app-badge bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
                🌐 웹에서 체험하기
              </Link>
            </div>

            <p className="text-white/80">
              iOS 14.0 이상, Android 8.0 이상 지원
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-gray-900 text-white py-16">
        <div className="footer-content max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="footer-section">
            <h3 className="text-xl font-bold mb-4">ZeroPlay</h3>
            <p className="text-gray-400 mb-4">청년들을 위한 <br />특별한 로컬 여행 서비스</p>
            <p className="text-gray-500 text-sm">Next.js + Supabase로 구현</p>
          </div>

          <div className="footer-section">
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">서비스 소개</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">AI 추천 시스템</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">로컬 스팟 등록</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">혜택 정보</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="text-lg font-semibold mb-4">고객지원</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">자주 묻는 질문</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">고객센터</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">개발자 문의</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">파트너십</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="text-lg font-semibold mb-4">약관 및 정책</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">이용약관</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">개인정보처리방침</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">위치정보 이용약관</Link>
              <Link href="#" className="block text-gray-400 hover:text-white transition-colors">청소년보호정책</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 ZeroPlay. All rights reserved.</p>
          <p className="mt-2 text-sm">
            본 서비스는 일부 상품에 대해 통신판매중개자로서 통신판매의 당사자가 아니므로, 상품의 예약, 이용 및 환불 등에 대한 의무와 책임은 각 판매자에게 있습니다.
          </p>
        </div>
      </footer>

      {/* Styles */}
      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .header {
          transition: transform 0.3s ease;
        }

        body.loaded .hero-content {
          opacity: 1;
          transition: opacity 1s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in,
          .animate-pulse {
            animation: none;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}