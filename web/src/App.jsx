import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { StartPage } from './pages/StartPage';
import { SearchPage } from './pages/SearchPage';
import { LoadingPage } from './pages/LoadingPage';
import { Dashboard } from './pages/DashboardPage'; // 대시보드 연결

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;