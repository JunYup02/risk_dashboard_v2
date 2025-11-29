/**
 * [main.jsx]
 * React 애플리케이션의 진입점(Entry Point) 파일입니다.
 * * * [핵심 역할]
 * 1. HTML 연결: index.html 파일에 있는 <div id="root"> 요소를 찾아냅니다.
 * 2. React 주입: 찾아낸 HTML 요소 안에 우리가 만든 React 앱(<App />)을 집어넣습니다.
 * 3. 스타일 적용: 전역 스타일(index.css)을 불러와서 앱 전체에 디자인을 입힙니다.
 */

import React from 'react'
// React 18 버전부터 사용되는 새로운 렌더링 라이브러리입니다.
import ReactDOM from 'react-dom/client'
// 우리가 만든 최상위 컴포넌트인 App을 불러옵니다.
import App from './App.jsx'
// Tailwind CSS 설정이 포함된 전역 스타일 파일을 불러옵니다.
// 이 줄이 있어야 Tailwind 클래스(bg-black, text-white 등)가 작동합니다.
import './index.css' 

// 1. document.getElementById('root'):
//    index.html 파일에 있는 id가 'root'인 div 태그를 찾습니다.
//    이곳이 React 앱이 그려질 도화지 역할을 합니다.

// 2. ReactDOM.createRoot(...):
//    찾아낸 div 태그를 React의 뿌리(Root)로 만듭니다.
//    이제부터 React가 이 영역을 관리하게 됩니다.

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>:
  // 개발 모드에서 잠재적인 문제를 감지하기 위한 도구입니다.
  // 이 감싸진 부분 내부의 컴포넌트들을 두 번씩 렌더링하며 검사하기 때문에,
  // console.log가 두 번 찍히는 것은 버그가 아니라 이 기능 때문입니다.
  <React.StrictMode>
    {/* 불러온 App 컴포넌트를 실제로 화면에 그립니다. */}
    <App />
  </React.StrictMode>,
)