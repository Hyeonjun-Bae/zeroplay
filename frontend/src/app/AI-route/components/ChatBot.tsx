'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  onRouteGenerated?: (routeData: any) => void;
  filters?: {
    budget: string;
    duration: string;
    companions: string;
    interests: string[];
    region: string;
  };
}

// ✅ 배포/로컬 겸용 API 베이스 URL & 경로 헬퍼
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const withBase = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;          // 절대 URL 그대로
  if (pathOrUrl.startsWith('/')) return `${API_BASE}${pathOrUrl}`; // '/api/...' 상대경로
  return `${API_BASE}/${pathOrUrl}`;
};

// ✅ 공통 API 호출 함수 (JSON 응답 안전 처리)
const apiCall = async (url: string, options: RequestInit = {}) => {
  const finalUrl = withBase(url);
  try {
    const res = await fetch(finalUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`응답 파싱 실패: ${text}`);
    }

    if (!res.ok) {
      const msg = data?.message || res.statusText || '요청 실패';
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }

    return data;
  } catch (err) {
    console.error('💥 API 호출 실패:', err);
    throw err;
  }
};

export default function ChatBot({ onRouteGenerated, filters }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! \nAI 여행 추천 서비스입니다.\n어떤 여행을 계획하고 계신가요?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // 키보드 숨기기
    if (inputRef.current) {
      inputRef.current.blur();
    }

    try {
      // 🔁 AI 채팅 API (하드코딩 제거)
      const result = await apiCall('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: currentInput,
          sessionId: 'session_' + Date.now()
        }),
      });

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: result?.data?.message || '응답을 받을 수 없습니다.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

      // 코스 생성 트리거
      if (currentInput.includes('추천') || currentInput.includes('코스') || currentInput.includes('여행')) {
        setTimeout(async () => {
          await generateTravelRoutes(currentInput);
        }, 2000);
      }

    } catch (error) {
      console.error('AI 채팅 에러:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTravelRoutes = async (userMessage: string) => {
    try {
      setIsLoading(true);

      // props로 전달받은 필터 사용
      const requestFilters = filters || {
        budget: '',
        duration: '',
        companions: '',
        interests: [],
        region: ''
      };

      // 🔁 코스 생성 API (하드코딩 제거)
      const result = await apiCall('/api/ai/generate-routes', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          filters: requestFilters,
          sessionId: 'session_' + Date.now()
        }),
      });

      if (result?.success && result?.data?.routes?.length > 0) {
        result.data.routes.forEach((route: any, index: number) => {
          setTimeout(() => {
            onRouteGenerated?.({
              id: route.id || `ai_route_${Date.now()}_${index}`,
              title: route.title,
              duration: route.duration,
              totalBudget: route.totalBudget,
              places: route.places || [],
              highlights: route.highlights || [],
              difficulty: route.difficulty || 'easy'
            });
          }, index * 500);
        });

        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: `${result.data.routes.length}개의 맞춤 여행 코스를 생성했어요! 🎉\n하단의 [추천 결과] 탭에서\n확인해보세요!`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        const noRouteMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: '조건에 맞는 여행 코스를 찾을 수 없습니다.\n다른 조건으로 다시 시도해보세요! 🔍',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, noRouteMessage]);
      }

    } catch (error) {
      console.error('코스 생성 에러:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: '코스 생성 중 문제가 발생했습니다.\n조건을 다시 설정해보세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 🔥 메시지 영역 - 하단 여백 크게 증가 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ paddingBottom: '140px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* 봇 아바타 */}
            {message.type === 'bot' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                <span className="text-white text-sm">🤖</span>
              </div>
            )}

            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md shadow-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <span className={`text-xs opacity-70 mt-2 block ${
                message.type === 'user' ? 'text-right text-blue-100' : 'text-left text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* 유저 아바타 */}
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center ml-3 flex-shrink-0 mt-1">
                <span className="text-white text-sm">👤</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400"></div>
                <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🔥 입력 영역 - 더 아래로 고정 */}
      <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-200">
        <div className="bg-gray-100 rounded-2xl p-2 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AI 코스 추천 받기"
            className="flex-1 bg-transparent px-3 py-2 text-base focus:outline-none placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-10 h-10 shadow-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
