# 📊 B.S.B - Corporate Risk Index Dashboard (Web Client)

\*\*B.S.B (Balance Sheet Analysis)\*\*는 기업의 재무제표 데이터를 분석하여 **재무 위험 지수**를 산출하고, **AI 기반의 심층 리포트**를 제공하는 웹 애플리케이션입니다.

사용자는 복잡한 재무 지표를 직관적인 **대시보드**로 확인할 수 있으며, 동종 업계 및 지역 평균과의 비교 분석을 통해 기업의 객관적인 위치를 파악할 수 있습니다.

-----

## 🚀 주요 기능 (Key Features)

### 1\. 🔍 기업 검색 및 데이터 조회

  - **실시간 검색:** Supabase DB와 연동하여 기업명 또는 종목코드로 실시간 검색 (Debouncing 적용).
  - **데이터 연동:** 선택한 기업의 최신 재무제표 및 과거 데이터를 로딩.

### 2\. 📉 종합 분석 대시보드

  - **4대 핵심 지표 시각화:** 유동성, 안정성, 수익성, 활동성 지표를 **Recharts**를 활용한 선 그래프로 시각화.
  - **종합 위험 점수 (Risk Score):** 사용자가 설정한 가중치(Slider)에 따라 실시간으로 변동되는 위험 지수 계산.
  - **Gemini AI 정밀 진단:** Google Gemini API를 활용하여 수치 데이터를 바탕으로 한 전문적인 투자 분석 코멘트 생성.

### 3\. 🆚 비교 분석 (Benchmark)

  - **업종(Industry) 대비 비교:** 동종 업계 평균 데이터와 내 기업의 위치를 \*\*이중 Y축 차트(Dual Axis Chart)\*\*로 비교.
  - **지역(Region) 대비 비교:** 해당 기업이 위치한 지역의 평균 재무 상태와 비교 분석.
  - **심층 분석 텍스트:** 단순 수치 비교를 넘어, 경영학적 의미(경쟁 우위, 리스크 등)를 해석한 텍스트 제공.

### 4\. 📄 보고서 생성 (Export)

  - **Word(.doc) 다운로드:** 분석된 차트 데이터, AI 진단 내용, 손익계산서/재무상태표 요약을 포함한 종합 보고서 생성 기능.

-----

## 🛠 기술 스택 (Tech Stack)

  - **Framework:** [React](https://react.dev/) (Vite)
  - **Language:** JavaScript (ES6+)
  - **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  - **Routing:** React Router DOM
  - **Visualization:** [Recharts](https://recharts.org/)
  - **Backend / DB:** [Supabase](https://supabase.com/)
  - **AI Integration:** Google Gemini API (REST via `fetch`)
  - **Icons:** Lucide React

-----

## 📂 프로젝트 구조 (Project Structure)

```bash
web/
├── public/              # 정적 자산 (favicon 등)
├── src/
│   ├── assets/          # 이미지, SVG 아이콘 리소스
│   ├── hooks/           # 커스텀 훅 (예: useRiskData.js - 데이터 페칭 로직 분리)
│   ├── lib/             # 외부 라이브러리 설정
│   │   ├── gemini.js           # Google Gemini API 통신 모듈
│   │   └── supabaseClient.js   # Supabase 클라이언트 설정
│   ├── pages/           # 페이지 컴포넌트
│   │   ├── LandingPage.jsx     # 메인 소개 페이지
│   │   ├── SearchPage.jsx      # 기업 검색
│   │   ├── DashboardPage.jsx   # 핵심 분석 대시보드
│   │   ├── IndustryComparePage.jsx # 업종 비교 페이지
│   │   ├── RegionComparePage.jsx   # 지역 비교 페이지
│   │   └── ... (TeamPage, CriteriaPage 등 정보 페이지)
│   ├── App.jsx          # 라우팅 설정 (Routes)
│   ├── main.jsx         # 진입점 (Entry Point)
│   └── index.css        # 전역 스타일 (Tailwind 설정 포함)
├── .env                 # 환경 변수 (API Key 등)
├── package.json         # 의존성 관리
├── tailwind.config.js   # Tailwind 설정
└── vite.config.js       # Vite 빌드 설정
```

-----

## ⚡️ 시작하기 (Getting Started)

### 1\. 설치 (Installation)

프로젝트 폴더(`web`)로 이동하여 의존성 패키지를 설치합니다.

```bash
cd web
npm install
```

### 2\. 환경 변수 설정 (Environment Variables)

프로젝트 루트(`web/`)에 `.env` 파일을 생성하고, 아래의 키 값을 입력해야 정상 작동합니다.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

### 3\. 실행 (Run)

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 주소)으로 접속합니다.

-----

## 📑 주요 페이지 설명

| 페이지 | 설명 |
| --- | --- |
| **LandingPage** | 서비스 소개 및 시작 버튼, 반응형 스케일링 적용 |
| **StartPage** | 감성적인 문구와 함께 분석 시작 유도 |
| **SearchPage** | Supabase 연동 실시간 기업 검색 (자동완성) |
| **LoadingPage** | 데이터 로딩 중 사용자 경험(UX)을 위한 중간 페이지 |
| **DashboardPage** | 종합 위험 점수, 4대 지표, 차트, AI 분석, 보고서 다운로드 |
| **ComparePages** | 업종/지역 평균 데이터와 비교하는 차트 및 인사이트 제공 |
| **Team/Update** | 개발팀 소개 및 서비스 업데이트 히스토리 |