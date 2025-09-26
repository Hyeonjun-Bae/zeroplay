// frontend/src/lib/api.ts (개선 버전)

const rawPublicBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || '';
// NEXT_PUBLIC_API_URL 이 설정되어 있으면 => "<backend-base>/api" 를 사용
// 설정이 없으면 개발: "http://localhost:3001/api", 프로덕션: "/api"
const API_BASE_URL =
  rawPublicBase
    ? `${rawPublicBase.replace(/\/+$/, '')}/api`
    : (process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001/api'
        : '/api');

// 내부에서만 쓰는 URL 조립기(중복 슬래시 방지)
const joinUrl = (base: string, endpoint: string) => {
  if (/^https?:\/\//i.test(endpoint)) return endpoint; // 이미 절대 URL이면 그대로
  const b = base.replace(/\/+$/, '');
  const e = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${b}${e}`;
};

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = joinUrl(API_BASE_URL, endpoint);
    console.log(`API 호출: ${url}`);

    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      });

      console.log(`응답 상태: ${res.status}`);

      const text = await res.text();
      let data: any = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          console.error(`API 에러: JSON 파싱 실패 - 원문: ${text}`);
          throw new Error(`API JSON Parse Error: ${res.status} ${res.statusText}`);
        }
      }

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || res.statusText;
        console.error(`API 에러: ${res.status} - ${msg}`);
        throw new Error(`API Error: ${res.status} ${msg}`);
      }

      console.log('응답 데이터:', data);
      return data as T;
    } catch (error) {
      console.error('API 호출 실패:', error);
      throw error;
    }
  }

  // ============================================================================
  // AI 관련 API
  // ============================================================================

  // AI 채팅 API
  static async chatWithAI(message: string, sessionId?: string) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  }

  // AI 코스 생성 API
  static async generateAIRoutes(message: string, filters: any, sessionId?: string) {
    return this.request('/ai/generate-routes', {
      method: 'POST',
      body: JSON.stringify({ message, filters, sessionId }),
    });
  }

  // 필터 기반 장소 검색 API
  static async searchPlaces(filters: any) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length) params.append(key, value.join(','));
      } else if (value != null && value !== '') {
        params.append(key, String(value));
      }
    });
    const qs = params.toString();
    return this.request(`/ai/search-places${qs ? `?${qs}` : ''}`);
  }

  // ============================================================================
  // 북마크 관련 API
  // ============================================================================

  // AI 루트 북마크 저장
  static async saveAIRouteBookmark(sessionId: string, routeData: any) {
    return this.request('/bookmarks/ai-route', {
      method: 'POST',
      body: JSON.stringify({ sessionId, routeData }),
    });
  }

  // AI 루트 북마크 목록 조회
  static async getAIBookmarks(sessionId: string) {
    return this.request(`/bookmarks/ai-routes/${sessionId}`);
  }

  // AI 루트 북마크 삭제
  static async deleteAIBookmark(bookmarkId: string, sessionId: string) {
    return this.request(`/bookmarks/ai-route/${bookmarkId}`, {
      method: 'DELETE',
      body: JSON.stringify({ sessionId }),
    });
  }

  // 북마크 통계 조회
  static async getBookmarkSummary(sessionId: string) {
    return this.request(`/bookmarks/summary/${sessionId}`);
  }

  // 모든 북마크 삭제
  static async deleteAllBookmarks(sessionId: string) {
    return this.request(`/bookmarks/all/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // 청년혜택 북마크 관련 API
  // ============================================================================

  static async saveBenefitBookmark(sessionId: string, benefitData: any) {
    return this.request('/bookmarks/benefit', {
      method: 'POST',
      body: JSON.stringify({ sessionId, benefitData }),
    });
  }

  static async getBenefitBookmarks(sessionId: string) {
    return this.request(`/bookmarks/benefits/${sessionId}`);
  }

  static async deleteBenefitBookmark(bookmarkId: string, sessionId: string) {
    return this.request(`/bookmarks/benefit/${bookmarkId}`, {
      method: 'DELETE',
      body: JSON.stringify({ sessionId }),
    });
  }

  // ============================================================================
  // 지도 북마크 관련 API
  // ============================================================================

  static async saveMapBookmark(sessionId: string, placeData: any) {
    return this.request('/bookmarks/map-place', {
      method: 'POST',
      body: JSON.stringify({ sessionId, placeData }),
    });
  }

  static async getMapBookmarks(sessionId: string) {
    return this.request(`/bookmarks/map-places/${sessionId}`);
  }

  static async deleteMapBookmark(bookmarkId: string, sessionId: string) {
    return this.request(`/bookmarks/map-place/${bookmarkId}`, {
      method: 'DELETE',
      body: JSON.stringify({ sessionId }),
    });
  }

  // ============================================================================
  // 기존 여행 관련 API
  // ============================================================================

  static async getRecommendations(data: any) {
    return this.request('/travel/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getYouthBenefits() {
    return this.request('/benefit/youth');
  }

  static async getRegionalDiscounts(region: string) {
    return this.request(`/benefit/regional/${region}`);
  }

  // ============================================================================
  // 유틸리티 메서드들
  // ============================================================================

  static async checkHealth() {
    return this.request('/health');
  }

  static async reportError(error: any, context?: string) {
    const userAgent =
      typeof navigator !== 'undefined' && navigator.userAgent
        ? navigator.userAgent
        : 'server';
    return this.request('/error-report', {
      method: 'POST',
      body: JSON.stringify({
        error: error?.message || String(error),
        context,
        timestamp: new Date().toISOString(),
        userAgent,
      }),
    }).catch(() => {
      console.warn('에러 리포팅 실패');
    });
  }
}
