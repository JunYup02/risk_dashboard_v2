/**
 * [App.jsx]
 * 어플리케이션의 메인 진입점입니다.
 * React Router를 사용하여 페이지 간의 이동(Routing)을 관리합니다.
 */

import React from 'react';
// React Router DOM 라이브러리에서 필요한 컴포넌트들을 가져옵니다.
// - BrowserRouter (Router): 브라우저의 주소를 감지하고 라우팅을 처리하는 최상위 컴포넌트
// - Routes: 여러 Route들을 감싸고, 현재 주소와 일치하는 하나의 Route만 렌더링합니다.
// - Route: 주소(path)와 보여줄 컴포넌트(element)를 연결하는 역할
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

/* --- [페이지 컴포넌트 Import] --- */
// 각 경로(URL)에 접속했을 때 보여줄 페이지 컴포넌트들을 불러옵니다.

// 1. 메인 및 소개 관련 페이지
import { LandingPage } from './pages/LandingPage';      // 랜딩 페이지 (첫 화면)
import { CriteriaPage } from './pages/CriteriaPage';    // 지표 산정 기준 설명 페이지
import { UpdateHistoryPage } from './pages/UpdateHistoryPage'; // 업데이트 기록 페이지
import { TeamPage } from './pages/TeamPage';            // 개발 팀 소개 페이지
import { DevelopmentPage } from './pages/DevelopmentPage'; // 개발 과정 기록 페이지

// 2. 서비스 시작 및 검색 플로우 페이지
import { StartPage } from './pages/StartPage';          // '시작하기' 클릭 시 이동하는 인트로 페이지
import { SearchPage } from './pages/SearchPage';        // 기업 검색 화면
import { LoadingPage } from './pages/LoadingPage';      // 데이터 분석 중 로딩 화면

// 3. 분석 결과 대시보드 및 상세 비교 페이지
import { Dashboard } from './pages/DashboardPage';          // 메인 분석 대시보드
import { IndustryComparePage } from './pages/IndustryComparePage'; // 업종 평균 비교 페이지
import { RegionComparePage } from './pages/RegionComparePage';     // 지역 평균 비교 페이지

// 커스텀 훅 Import (현재 직접 사용되진 않지만, 전역 상태 관리 등을 위해 남겨둠)
import { useRiskData } from './hooks/useRiskData';

function App() {
  return (
    // <Router>: 라우팅 기능을 활성화하기 위해 앱 전체를 감쌉니다.
    <Router>
      {/* <Routes>: 현재 URL 경로에 맞는 단 하나의 Route만 렌더링하도록 합니다. */}
      <Routes>
        
        {/* --- [섹션 1: 메인 및 정보 제공 페이지] --- */}
        {/* path="/": 웹사이트 접속 시 가장 먼저 보여지는 루트 페이지 (랜딩 페이지) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* path="/criteria": 사용자가 '지표산정기준' 메뉴 클릭 시 이동 */}
        <Route path="/criteria" element={<CriteriaPage />} />
        
        {/* path="/updates": 사용자가 '업데이트 기록' 메뉴 클릭 시 이동 */}
        <Route path="/updates" element={<UpdateHistoryPage />} />
        
        {/* path="/team": 사용자가 '개발 팀' 메뉴 클릭 시 이동 */}
        <Route path="/team" element={<TeamPage />} />
        
        {/* path="/development": 사용자가 '개발 과정' 메뉴 클릭 시 이동 */}
        <Route path="/development" element={<DevelopmentPage />} />
        

        {/* --- [섹션 2: 서비스 시작 및 검색 프로세스] --- */}
        {/* path="/start": 랜딩 페이지에서 'Next' 또는 시작 버튼을 누르면 이동 */}
        <Route path="/start" element={<StartPage />} />
        
        {/* path="/search": 기업을 검색하는 화면 */}
        <Route path="/search" element={<SearchPage />} />
        
        {/* path="/loading": 검색 후 결과를 불러오는 동안 보여주는 로딩 화면 */}
        <Route path="/loading" element={<LoadingPage />} />
        

        {/* --- [섹션 3: 분석 결과 페이지 (대시보드)] --- */}
        {/* path="/dashboard": 종합적인 기업 분석 결과를 보여주는 메인 대시보드 */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* path="/industry-compare": 해당 기업과 '업종' 평균 데이터를 비교하는 상세 페이지 */}
        <Route path="/industry-compare" element={<IndustryComparePage />} />
        
        {/* path="/region-compare": 해당 기업과 '지역' 평균 데이터를 비교하는 상세 페이지 */}
        <Route path="/region-compare" element={<RegionComparePage />} />
        
      </Routes>
    </Router>
  );
}

export default App;