import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownCircle, ArrowRight } from "lucide-react"; 

// assets 폴더 이미지 import (복구)
import arrow1 from "../assets/arrow-1.svg";
import image from "../assets/image.svg";
import vector2 from "../assets/vector-2.svg";
import vector3 from "../assets/vector-3.svg";
import vector from "../assets/vector.svg";

const navigationItems = [
  { id: 1, label: "지표산정기준", marginLeft: "ml-0", marginTop: "mt-[11px]", path: "/criteria" }, 
  { id: 2, label: "업데이트 기록", marginLeft: "ml-[67px]", marginTop: "mt-[26px]", path: "#" },
  { id: 3, label: "개발 과정", marginLeft: "ml-[37px]", marginTop: "mt-7", path: "/development" },
  // 경로를 /team으로 변경
  { id: 4, label: "개발 팀", marginLeft: "ml-[55px]", marginTop: "mt-7", path: "/team" }, 
];

const iconData = [
  { id: 1, src: vector, alt: "Vector", className: "absolute w-[9.00%] h-[13.73%] top-[75.48%] left-[9.87%]" },
  { id: 2, alt: "Vector Icon", className: "absolute w-[6.60%] h-[10.07%] top-[78.54%] left-[22.20%]", hasNested: true },
  { id: 3, src: vector3, alt: "Vector", className: "absolute w-[4.67%] h-[7.12%] top-[81.18%] left-[32.13%]" },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownload = () => alert("준비중입니다");
  const handleNext = () => navigate("/start");

  const scaledHeight = 983 * scale;

  return (
    <div className="w-full h-screen bg-black overflow-y-auto overflow-x-hidden">
      <div style={{ width: '100%', height: `${scaledHeight}px` }}>
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left',
            width: '1500px', 
            height: '983px',
          }}
          className="relative bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(180deg,rgba(170,170,170,1)_24%,rgba(68,68,68,1)_100%)]"
        >
          <header className="absolute top-0 left-[-30px] w-[1961px] h-[126px] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(0deg,rgba(170,170,170,1)_0%,rgba(170,170,170,1)_100%)]" />

          <h1 className="absolute top-[59px] left-[99px] w-[233px] font-sans font-semibold text-white text-[34px] tracking-[-0.85px] leading-[normal]">
            Balance Sheet
          </h1>

          <nav className="absolute top-[45px] left-[750px] w-[611px] h-[65px] flex" role="navigation">
            {navigationItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => item.path && navigate(item.path)}
                className={`${item.marginTop} ${item.id === 1 ? "h-5 w-[117px]" : item.id === 2 ? "w-[145px] h-[22px]" : item.id === 3 ? "w-[85px] h-5" : "w-[72px] h-5"} ${item.marginLeft} ${item.id === 1 ? "self-center" : ""} font-medium text-white text-[21px] tracking-[-0.53px] leading-[normal] whitespace-nowrap cursor-pointer hover:text-gray-300 transition-colors`}
              >
                {item.label}
              </div>
            ))}
          </nav>

          <h2 className="absolute top-[280px] left-[174px] w-[722px] font-sans font-semibold text-white text-[64px] tracking-[-1.60px] leading-[normal]">
            재무정보를 활용한<br />기업 위험 지수 확인 시스템
          </h2>
          <p className="absolute top-[544px] left-[174px] w-[662px] font-sans font-medium text-white text-[32px] tracking-[-0.80px] leading-[normal]">
            우리 기업의 재무 위험 지수를 한눈에 확인하고, <br />안전 경영을 위한 최적의 전략을 세우세요.
          </p>

          {iconData.map((icon) =>
            icon.hasNested ? (
              <div key={icon.id} className={icon.className}>
                <img className="absolute w-[55.56%] h-[55.56%] top-[22.22%] left-[22.22%]" alt="Vector Inner" src={image} />
                <img className="absolute w-full h-full top-0 left-0" alt="Vector Outer" src={vector2} />
              </div>
            ) : (
              <img key={icon.id} className={icon.className} alt={icon.alt} src={icon.src} />
            )
          )}

          <button onClick={handleDownload} className="absolute top-[169px] left-[1150px] w-[278px] h-[76px] hover:opacity-90 transition-opacity group cursor-pointer">
            <div className="absolute top-0 left-0 w-[276px] h-[76px] bg-[#f0f0f0] rounded-lg shadow-[0px_8px_4px_#00000040]" />
            <ArrowDownCircle className="absolute top-3.5 left-[205px] w-12 h-12 text-gray-800 group-hover:translate-y-1 transition-transform" />
            <span className="absolute top-6 left-6 w-[187px] font-medium text-[#050505] text-2xl tracking-[-0.60px] leading-[normal] whitespace-nowrap">데이터 다운로드</span>
          </button>

          <button onClick={handleNext} className="absolute top-[772px] left-[1265px] w-[166px] h-[68px] flex bg-neutral-100 rounded-xl hover:bg-white transition-colors cursor-pointer items-center justify-center shadow-lg">
            <div className="flex gap-[13.5px] items-center">
              <span className="font-medium text-[#050505] text-2xl tracking-[-0.60px]">Next</span>
              <img className="w-[27.5px] h-[17.32px]" alt="Arrow" src={arrow1} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};