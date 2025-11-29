# B.S.B (Balance Sheet Board) - 기업 위험지수 분석 대시보드

## 📖 프로젝트 소개 (About Project)

**B.S.B (Balance Sheet Board)**는 기업의 재무 데이터를 기반으로 위험 지수를 자동으로 산출하고 시각화하여 제공하는 웹 기반 대시보드 시스템입니다.

복잡한 재무제표를 일반 투자자와 기업 관리자가 쉽게 이해할 수 있도록 **시각화(Visualization)**하고, **Altman Z-Score** 및 주요 재무 비율(유동성, 안정성, 수익성, 활동성)을 분석합니다. 또한, **Google Gemini AI**를 연동하여 정성적인 투자 조언 리포트를 제공합니다.

### 🎯 주요 기능 (Key Features)

* **데이터 자동 수집 및 가공 (ETL):** Raw Excel 데이터에서 재무 정보를 추출하여 표준화된 DB로 적재.
* **기업 위험 지수 산출:** 사용자가 설정한 가중치에 따라 실시간으로 위험 점수(0~100) 계산.
* **인터랙티브 대시보드:** Recharts를 활용한 직관적인 재무 지표 추이 그래프 제공.
* **비교 분석:** 동종 업계 평균 및 지역 평균과의 재무 건전성 비교.
* **AI 투자 리포트:** Google Gemini AI가 분석한 기업의 재무 상태 3줄 요약 및 상세 진단.
* **종합 보고서 생성:** 분석 결과를 포함한 Word(.doc) 보고서 다운로드 기능.

---

## 🛠 기술 스택 (Tech Stack)

### **Backend & Data Processing**
* **Language:** Python 3.9+
* **Libraries:** Pandas, NumPy, OpenPyXL
* **Database:** Supabase (PostgreSQL)
* **Auth:** Supabase Auth

### **Frontend**
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS
* **Visualization:** Recharts
* **State Management:** React Router DOM
* **AI Integration:** Google Gemini API

---

## 📂 폴더 구조 (Directory Structure)

```bash
risk_dashboard_v2/
├── data/                  # 데이터 저장소
│   ├── raw/               # 원본 재무제표 엑셀 파일 (VALUESearch*.xlsx)
│   └── processed/         # 전처리 완료된 CSV 파일
├── src/                   # Python 데이터 처리 스크립트
│   ├── preprocess.py      # 엑셀 데이터 전처리 및 CSV 변환
│   ├── loader.py          # CSV 데이터를 Supabase DB에 적재
│   └── test_score.py      # 위험 점수 산출 로직 테스트
├── web/                   # React 프론트엔드 프로젝트
│   ├── public/            # 정적 파일
│   ├── src/
│   │   ├── assets/        # 이미지 및 SVG 아이콘
│   │   ├── hooks/         # 커스텀 훅 (useRiskData 등)
│   │   ├── lib/           # 외부 라이브러리 설정 (Supabase, Gemini)
│   │   ├── pages/         # 라우팅 페이지 (Dashboard, Search 등)
│   │   └── App.jsx        # 메인 앱 컴포넌트
│   └── ...config files
├── requirements.txt       # 파이썬 의존성 목록
└── README.md              # 프로젝트 설명 문서
```

-----

## 🚀 설치 및 실행 방법 (Getting Started)

### 1\. 사전 준비 (Prerequisites)

  * **Node.js** (v18 이상 권장)
  * **Python** (3.9 이상)
  * **Supabase Account** (Project URL & API Key)
  * **Google Gemini API Key**

### 2\. 프로젝트 클론 (Clone)

```bash
git clone [https://github.com/JunYup02/risk_dashboard_v2.git](https://github.com/JunYup02/risk_dashboard_v2.git)
cd risk_dashboard_v2
```

### 3\. 백엔드 데이터 처리 (Python)

가상환경 생성 및 패키지 설치:

```bash
# 가상환경 생성 (선택사항)
python -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows

# 의존성 설치
pip install -r requirements.txt
```

환경 변수 설정 (`.env` 파일 생성):
프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 입력하세요.

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

데이터 전처리 및 DB 적재 실행:

```bash
# 1. 원본 엑셀 파일을 CSV로 변환
python src/preprocess.py

# 2. 변환된 데이터를 Supabase에 업로드
python src/loader.py
```

### 4\. 프론트엔드 실행 (React)

웹 디렉토리로 이동 및 패키지 설치:

```bash
cd web
npm install
```

환경 변수 설정 (`web/.env` 파일 생성):
`web` 폴더 안에 `.env` 파일을 생성하세요.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

개발 서버 실행:

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 확인합니다.

-----

## 📊 데이터베이스 스키마 (Database Schema)

Supabase SQL Editor에서 다음 테이블을 생성해야 합니다.

**1. companies (기업 정보)**

  * `stock_code` (text, PK): 종목코드
  * `company_name` (text): 기업명
  * `industry` (text): 산업군
  * `region` (text): 지역
  * `market_cap_recent` (numeric): 시가총액

**2. financial\_reports (재무 보고서)**

  * `id` (uuid, PK)
  * `stock_code` (text, FK -\> companies.stock\_code)
  * `period` (text): 기간 (예: 2023/12/Annual)
  * `current_ratio` (float): 유동비율
  * `debt_to_equity_ratio` (float): 부채비율
  * `roe` (float): 자기자본이익률
  * `interest_coverage_ratio` (float): 이자보상배율
  * `altman_z_score` (float): Z-Score
  * ... (기타 재무 계정)

---

### 💡 추가 조치 사항 (GitHub 업로드 전 필독)

1.  **`.gitignore` 확인:**
    루트 디렉토리와 `web/` 디렉토리에 각각 `.gitignore` 파일이 있는지 확인하세요. **`node_modules/`, `.env`, `venv/`, `__pycache__/`, `.DS_Store`** 폴더나 파일은 절대 GitHub에 올라가면 안 됩니다.
    * 만약 없다면 루트에 `.gitignore`를 만들고 다음 내용을 넣으세요:
        ```text
        node_modules/
        .env
        venv/
        __pycache__/
        .DS_Store
        dist/
        *.log
        ```

2.  **환경 변수 보안:**
    위 README의 설치 방법 섹션에 있는 `.env` 설정 가이드에서, 실제 키 값(`your_supabase_url` 등)은 비워두고 설명만 적어두었습니다. 이는 보안을 위해 올바른 방식입니다. 실제 키가 포함된 파일을 커밋하지 않도록 주의하세요.
