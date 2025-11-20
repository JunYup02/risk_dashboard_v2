import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { StartPage } from './pages/StartPage';
import { SearchPage } from './pages/SearchPage';
import { LoadingPage } from './pages/LoadingPage';
import { Dashboard } from './pages/DashboardPage';
import { CriteriaPage } from './pages/CriteriaPage'; 
import { TeamPage } from './pages/TeamPage';
import { DevelopmentPage } from './pages/DevelopmentPage'; // 개발 과정 페이지
import { IndustryComparePage } from './pages/IndustryComparePage'; // 업종 비교 페이지
import { useRiskData } from './hooks/useRiskData';

// Dashboard 컴포넌트 (DashboardPage.jsx에서 import 됨)
// App.jsx 내부의 임시 정의는 제거되었습니다.

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/criteria" element={<CriteriaPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/development" element={<DevelopmentPage />} />
        
        {/* 시작 및 분석 플로우 */}
        <Route path="/start" element={<StartPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        
        {/* 분석 대시보드 및 비교 페이지 */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/industry-compare" element={<IndustryComparePage />} />
        <Route path="/region-compare" element={<IndustryComparePage />} /> {/* 지역 비교도 임시로 같은 컴포넌트 사용 */}
      </Routes>
    </Router>
  );
}

export default App;