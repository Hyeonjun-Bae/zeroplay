import BenefitDetailPage from '@/app/Benefits/components/BenefitDetailPage';

// 청년 문화패스 더미데이터
const dummyBenefit = {
  id: 1,
  title: '청년 문화패스',
  organization: '문화체육관광부 • 2025년',
  amount: '10만원',
  amountType: '연간 지원금 (문화비 형태 지원)',
  icon: '🎭',
  description: '전국 문화시설 이용료, 도서 구입, 공연관람 등에 사용 가능한 문화비를 10만원 지원',
  usageAreas: [
    '공연 관람 (연극, 뮤지컬, 콘서트 등)',
    '전시 관람 (미술관, 박물관, 갤러리 등)',
    '도서 구매 (서점, 온라인 서점)',
    '영화 관람',
  ],
  eligibility: {
    age: '만 19세~24세 (2000~2005년생)',
    income: '중위소득 120% 이하',
    other: '대한민국 국민, 1인 1계정 신청'
  },
  applicationInfo: {
    period: '2025년 9월 1일 ~ 12월 31일',
    usagePeriod: '지급일로부터 12개월',
    paymentMethod: '모바일 및 온라인 형태'
  },
  applicationSteps: [
    '문화패스 앱 다운로드 - App Store 또는 Google Play에서 \'문화패스\' 검색',
    '회원가입 및 본인인증 - 휴대폰 번호와 본인인증을 통한 가입',
    '신청서 작성 - 개인정보와 소득 인증서류 업로드',
    '승인 확인 - 3~5일 후 승인 결과 및 문화비 지급'
  ],
  warnings: [
    '중복 신청시 시간 제약',
    '허위 정보 입력시 사용 제한',
    '소득인증 허위 입력 불가',
    '사용 기간 만료시 사용 소멸'
  ],
  applicationUrl: 'https://culture.go.kr'
};

// KTX 청년 할인 더미데이터
const ktxBenefit = {
  id: 4,
  title: 'KTX 청년 할인',
  organization: '한국철도공사 • 2025년',
  amount: '30%',
  amountType: '할인 (KTX 일반실 기준)',
  icon: '🚄',
  description: '만 19-24세 청년을 대상으로 KTX 일반실 운임을 30% 할인해주는 혜택',
  usageAreas: [
    'KTX 일반실 (전 노선)',
    'KTX-산천 일반실',
    '온라인 예매 (코레일톡, 홈페이지)',
    '역 창구 현장 구매'
  ],
  eligibility: {
    age: '만 19세~24세 (2000~2005년생)',
    income: '소득 제한 없음',
    other: '대한민국 국민, 신분증 지참 필수'
  },
  applicationInfo: {
    period: '2025년 1월 1일 ~ 6월 31일',
    usagePeriod: '할인 기간 내 무제한',
    paymentMethod: '예매 시 자동 할인 적용'
  },
  applicationSteps: [
    '코레일톡 앱 다운로드 - 스마트폰에서 코레일톡 설치',
    '회원가입 및 연령 인증 - 생년월일 입력으로 자동 확인',
    'KTX 승차권 예매 - 원하는 열차 선택 후 예매',
    '할인 적용 확인 - 결제 시 30% 할인된 금액 확인'
  ],
  warnings: [
    '특실은 할인 대상 제외',
    '성수기 일부 열차 할인 제외',
    '타 할인과 중복 적용 불가',
    '신분증 미지참시 할인 취소'
  ],
  applicationUrl: 'https://www.letskorail.com'
};

// 제주 청년 숙박지원 더미데이터
const jejuBenefit = {
  id: 5,
  title: '제주 청년 숙박지원',
  organization: '제주특별자치도 • 2025년',
  amount: '5만원',
  amountType: '쿠폰 (1박당 최대 지원)',
  icon: '🏝️',
  description: '도외 거주 청년의 제주 관광 활성화를 위한 1박당 최대 5만원 숙박비 지원',
  usageAreas: [
    '제주도 내 관광숙박업체',
    '펜션, 게스트하우스',
    '호텔, 리조트',
    '한옥체험업소'
  ],
  eligibility: {
    age: '만 19세~34세',
    income: '제한 없음',
    other: '제주도 외 지역 거주자, 1인당 연 2회 한정'
  },
  applicationInfo: {
    period: '2025년 3월 1일 ~ 11월 30일',
    usagePeriod: '쿠폰 발급일로부터 3개월',
    paymentMethod: '모바일 쿠폰 형태'
  },
  applicationSteps: [
    '제주관광공사 홈페이지 접속 - 청년 숙박지원 페이지 이동',
    '본인인증 및 신청서 작성 - 거주지 확인 및 개인정보 입력',
    '숙박업체 선택 및 예약 - 참여업체 중 원하는 숙소 예약',
    '현장 결제시 쿠폰 사용 - 체크인 시 쿠폰 제시 후 할인'
  ],
  warnings: [
    '도내 거주자는 신청 불가',
    '성수기 일부 업체 제외',
    '쿠폰 양도 및 재발급 불가',
    '노쇼 발생시 향후 신청 제한'
  ],
  applicationUrl: 'https://www.visitjeju.net'
};

// 숲나들e 더미데이터
const forestBenefit = {
  id: 2,
  title: '숲나들e',
  organization: '산림청 • 2025년',
  amount: '무료',
  amountType: '체험 (자연휴양림 무료입장)',
  icon: '🌲',
  description: '전국 자연휴양림을 무료로 이용할 수 있는 산림청 혜택 프로그램',
  usageAreas: [
    '전국 자연휴양림 입장료 면제',
    '산림욕장 이용',
    '등산로 및 산책로 이용',
    '숲해설 프로그램 참여'
  ],
  eligibility: {
    age: '전 연령 이용 가능',
    income: '소득 제한 없음',
    other: '대한민국 국민 및 외국인 모두 이용 가능'
  },
  applicationInfo: {
    period: '연중 상시',
    usagePeriod: '무제한',
    paymentMethod: '현장 신분증 확인'
  },
  applicationSteps: [
    '가까운 자연휴양림 방문 - 전국 150여개 자연휴양림 선택',
    '매표소에서 신분증 제시 - 무료입장 확인',
    '자유롭게 산림욕 즐기기 - 등산로, 산책로 자유 이용',
    '숲해설 프로그램 참여 - 시간대별 무료 해설 프로그램'
  ],
  warnings: [
    '일부 유료 시설은 별도 결제',
    '성수기 주차장 혼잡',
    '우천시 일부 시설 이용 제한',
    '안전수칙 필수 준수'
  ],
  applicationUrl: 'https://www.foresttrip.go.kr'
};

// 서울 청년 문화공간 더미데이터
const seoulBenefit = {
  id: 3,
  title: '서울 청년 문화공간',
  organization: '서울시 • 2025년',
  amount: '무료',
  amountType: '이용권 (청년센터 무료 이용)',
  icon: '🏢',
  description: '서울 거주 청년을 위한 문화공간 및 청년센터 무료 이용 혜택',
  usageAreas: [
    '청년센터 공간 이용',
    '세미나실, 스터디룸 예약',
    '문화 프로그램 참여',
    '취업 지원 서비스 이용'
  ],
  eligibility: {
    age: '만 19세~34세',
    income: '소득 제한 없음',
    other: '서울시 거주 청년 (주민등록 기준)'
  },
  applicationInfo: {
    period: '연중 상시',
    usagePeriod: '회원 자격 유지시 계속 이용',
    paymentMethod: '회원가입 후 예약제 운영'
  },
  applicationSteps: [
    '서울청년포털 회원가입 - 온라인 가입 및 본인인증',
    '거주지 확인서류 제출 - 주민등록등본 또는 거주확인서',
    '이용하고자 하는 센터 선택 - 25개 자치구별 청년센터',
    '온라인 예약 후 방문 - 홈페이지에서 시설 예약'
  ],
  warnings: [
    '타 지역 거주자는 이용 불가',
    '예약 취소시 패널티 부과',
    '시설 이용규칙 준수 필수',
    '프로그램별 정원 한정'
  ],
  applicationUrl: 'https://youth.seoul.go.kr'
};

// 경기 청년 여행지원 더미데이터  
const gyeonggiBenefit = {
  id: 6,
  title: '경기 청년 여행지원',
  organization: '경기도 • 2025년',
  amount: '20%',
  amountType: '할인 (도내 관광지 할인)',
  icon: '🎡',
  description: '경기도 거주 청년을 위한 도내 관광지 및 체험시설 20% 할인 혜택',
  usageAreas: [
    '경기도 내 관광지 입장료',
    '체험 프로그램 이용료',
    '도내 박물관, 미술관',
    '테마파크 및 놀이시설'
  ],
  eligibility: {
    age: '만 19세~34세',
    income: '소득 제한 없음',
    other: '경기도 거주 청년 (주민등록 기준)'
  },
  applicationInfo: {
    period: '2025년 1월 1일 ~ 10월 31일',
    usagePeriod: '쿠폰 발급일로부터 6개월',
    paymentMethod: '모바일 쿠폰 및 현장 할인'
  },
  applicationSteps: [
    '경기관광포털 접속 - 청년 여행지원 페이지 이동',
    '본인인증 및 거주지 확인 - 주민등록 기반 인증',
    '관광지 선택 및 쿠폰 발급 - 원하는 관광지 쿠폰 다운로드',
    '현장 방문시 쿠폰 사용 - 매표소에서 쿠폰 제시'
  ],
  warnings: [
    '타 지역 거주자 이용 불가',
    '일부 특가 상품 제외',
    '쿠폰 중복 사용 불가',
    '양도 및 현금 환불 불가'
  ],
  applicationUrl: 'https://ggtour.or.kr'
};

// ID별 혜택 찾기 함수
const getBenefitById = (id: string) => {
  const benefits = [dummyBenefit, forestBenefit, seoulBenefit, ktxBenefit, jejuBenefit, gyeonggiBenefit];
  return benefits.find(b => b.id === parseInt(id));
};

export default function BenefitDetail({ params }: { params: { id: string } }) {
  const benefit = getBenefitById(params.id);
  
  if (!benefit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">혜택을 찾을 수 없습니다</h1>
          <p className="text-gray-600">올바른 혜택 ID를 확인해주세요.</p>
        </div>
      </div>
    );
  }
  
  return <BenefitDetailPage benefit={benefit} />;
}