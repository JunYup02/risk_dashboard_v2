/**
 * [RegionComparePage.jsx]
 * 선택한 기업의 재무 지표를 해당 기업이 위치한 '지역(Region)'의 평균 데이터와 비교하는 분석 페이지입니다.
 * * [주요 기능]
 * 1. 지역 데이터 조회: 기업의 지역 정보를 확인하고, 해당 지역의 평균 재무 지표를 Supabase에서 가져옵니다.
 * 2. 이중 Y축 차트: 업종 비교와 마찬가지로 단위가 다른 지표들을 효과적으로 시각화합니다.
 * 3. 심층 분석: 지역 평균 대비 내 기업의 재무적 위치를 해석하여 구체적인 코멘트를 제공합니다.
 */

import React, { useState, useEffect } from "react";
// 페이지 이동 및 데이터 전달용 훅
import { useLocation, useNavigate } from "react-router-dom";
// 차트 라이브러리
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// 데이터베이스 클라이언트
import { supabase } from "../lib/supabaseClient";

/* --- [컴포넌트] Analysis Card (디자인 동일) --- */
// 각 지표별 수치 비교 카드를 렌더링하는 컴포넌트입니다.
// IndustryComparePage의 카드와 동일한 디자인과 로직을 사용합니다.
const AnalysisCard = ({ title, myValue, avgValue, status, diff, diffValue, bgColor }) => {
    // 상태에 따른 스타일 결정
    const isExcellent = status === 'excellent';
    const statusBgColor = isExcellent ? "bg-[#daffe0]" : "bg-[#ffdada]";
    const statusBorderColor = isExcellent ? "border-[#cdf5d3]" : "border-[#f5cdcd]";
    const statusTextColor = isExcellent ? "text-[#017200]" : "text-[#ff1212]";
    const statusText = isExcellent ? "우수" : "부족";

    return (
        <div className="relative w-full h-[210px]">
            {/* 배경 레이어 */}
            <div className={`absolute top-1 left-1 w-full h-full rounded-[15px] shadow-sm opacity-60 ${bgColor}`} />
            {/* 콘텐츠 레이어 */}
            <div className="absolute top-0 left-0 w-full h-full bg-white rounded-[15px] shadow-md p-5 flex flex-col justify-between border border-gray-100">
                <div className="flex justify-end mb-1">
                    <h3 className="text-lg font-bold text-gray-700 tracking-tight">{title}</h3>
                </div>
                {/* 수치 비교 */}
                <div className="flex items-end gap-3 mb-2">
                    <div className="flex-1 flex flex-col items-center">
                         <span className="text-xs font-semibold text-gray-500 mb-1">내 기업</span>
                         <div className="w-full bg-white border-2 border-gray-100 rounded-xl py-3 flex items-center justify-center text-xl font-extrabold text-black shadow-sm">
                            {myValue}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-xs font-medium text-gray-400 mb-1">지역 평균</span>
                        <div className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 flex items-center justify-center text-xl font-bold text-gray-500">
                            {avgValue}
                        </div>
                    </div>
                </div>
                {/* 결과 요약 */}
                <div className={`w-full py-2 px-4 ${statusBgColor} border ${statusBorderColor} rounded-lg flex items-center justify-between`}>
                    <span className={`text-sm font-bold ${statusTextColor}`}>{diffValue}</span>
                    <span className={`text-sm font-bold ${statusTextColor}`}>{statusText}</span>
                </div>
            </div>
        </div>
    );
};

export const RegionComparePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 이전 페이지에서 전달받은 데이터
    const selectedCompany = location.state?.selectedCompany;
    const latestData = location.state?.latestData;
    
    // [상태] 지역 평균 데이터 및 로딩 상태
    const [regionData, setRegionData] = useState(null); 
    const [loading, setLoading] = useState(true);

    // [Effect] 지역 데이터 조회
    useEffect(() => {
        if (!selectedCompany || !latestData) {
            setLoading(false);
            return;
        }

        const fetchRegionData = async () => {
            setLoading(true);
            try {
                // 1단계: 기업의 '지역(region)' 정보 확인
                const { data: companyInfo } = await supabase
                    .from('companies')
                    .select('region')
                    .eq('stock_code', selectedCompany.stock_code)
                    .single();

                const regionName = companyInfo?.region || selectedCompany.region || 'Unknown';

                // 2단계: 해당 지역의 평균 데이터 조회 (region_averages 테이블)
                const { data: avgData, error: avgError } = await supabase
                    .from('region_averages')
                    .select('avg_current_ratio, avg_debt_to_equity_ratio, avg_roe, avg_interest_coverage_ratio')
                    .eq('region', regionName)
                    .single();

                if (avgError || !avgData) throw avgError;

                setRegionData({
                    current_ratio: avgData.avg_current_ratio || 0,
                    debt_to_equity_ratio: avgData.avg_debt_to_equity_ratio || 0,
                    roe: avgData.avg_roe || 0,
                    interest_coverage_ratio: avgData.avg_interest_coverage_ratio || 0,
                    regionName: regionName
                });
            } catch (error) {
                console.error("지역 데이터 로드 실패:", error);
                setRegionData(null);
            }
            setLoading(false);
        };
        fetchRegionData();
    }, [selectedCompany, latestData]);

    if (!selectedCompany || !latestData) {
        return (
            <div className="min-h-screen bg-[#2c2c2c] flex flex-col items-center justify-center text-white gap-4">
                <div className="text-2xl font-bold">데이터를 불러올 수 없습니다.</div>
                <button onClick={() => navigate('/search')} className="px-6 py-2 bg-blue-600 rounded-full">기업 검색으로 이동</button>
            </div>
        );
    }

    if (loading) return <div className="min-h-screen bg-[#2c2c2c] flex items-center justify-center text-white">Loading...</div>;

    // 숫자 포맷팅 함수
    const formatVal = (val, unit = '') => val ? `${Number(val).toFixed(0)}${unit}` : '0';
    const formatValDec = (val, unit = '') => val ? `${Number(val).toFixed(1)}${unit}` : '0';

    // 분석 카드 데이터 생성
    const getAnalysisCards = () => {
        if (!regionData) return [];
        const c = latestData;
        const r = regionData;

        const calcDiff = (my, avg, isHigherBetter = true) => {
            const diff = my - avg;
            const isGood = isHigherBetter ? diff > 0 : diff < 0;
            const sign = diff > 0 ? '+' : '';
            return {
                status: isGood ? 'excellent' : 'insufficient',
                diffStr: `${sign} ${diff.toFixed(1)}`
            };
        };

        const liq = calcDiff(c.current_ratio, r.current_ratio, true);
        const stab = calcDiff(c.debt_to_equity_ratio, r.debt_to_equity_ratio, false);
        const prof = calcDiff(c.roe, r.roe, true);
        const act = calcDiff(c.interest_coverage_ratio, r.interest_coverage_ratio, true);

        return [
            { 
                id: 'liquidity', title: '유동성', bgColor: 'bg-[#5252ff]',
                myValue: formatVal(c.current_ratio, '%'), avgValue: formatVal(r.current_ratio, '%'),
                status: liq.status, diffValue: `${liq.diffStr}% 차이`
            },
            { 
                id: 'stability', title: '안정성', bgColor: 'bg-[#ff2912]',
                myValue: formatVal(c.debt_to_equity_ratio, '%'), avgValue: formatVal(r.debt_to_equity_ratio, '%'),
                status: stab.status, diffValue: `${stab.diffStr}% 차이`
            },
            { 
                id: 'profitability', title: '수익성', bgColor: 'bg-[#24992e]',
                myValue: formatValDec(c.roe, '%'), avgValue: formatValDec(r.roe, '%'),
                status: prof.status, diffValue: `${prof.diffStr}% 차이`
            },
            { 
                id: 'activity', title: '활동성', bgColor: 'bg-[#fcb124]',
                myValue: formatValDec(c.interest_coverage_ratio, '배'), avgValue: formatValDec(r.interest_coverage_ratio, '배'),
                status: act.status, diffValue: `${act.diffStr}배 차이`
            },
        ];
    };

    const analysisCards = getAnalysisCards();

    // 이중 Y축 차트 데이터 구성
    const barChartData = regionData ? [
        { 
            name: '유동성', 
            '선택기업_L': Number(latestData.current_ratio?.toFixed(0)), 
            '지역평균_L': Number(regionData.current_ratio?.toFixed(0)) 
        },
        { 
            name: '안정성', 
            '선택기업_L': Number(latestData.debt_to_equity_ratio?.toFixed(0)), 
            '지역평균_L': Number(regionData.debt_to_equity_ratio?.toFixed(0)) 
        },
        { 
            name: '수익성', 
            '선택기업_R': Number(latestData.roe?.toFixed(1)), 
            '지역평균_R': Number(regionData.roe?.toFixed(1)) 
        },
        { 
            name: '활동성', 
            '선택기업_R': Number(latestData.interest_coverage_ratio?.toFixed(1)), 
            '지역평균_R': Number(regionData.interest_coverage_ratio?.toFixed(1)) 
        },
    ] : [];

    // --- [수정: 심층 분석 텍스트 강화] ---
    // 지역 데이터와 비교하여 재무적 의미를 해석하는 문장 생성
    const getAnalysisText = () => {
        if(!regionData) return [];
        const c = latestData;
        const r = regionData;

        // 문자열 변환 (소수점 제거 등)
        const avgLiq = r.current_ratio.toFixed(0);
        const liqDiff = (c.current_ratio - r.current_ratio).toFixed(0);
        const stabDiff = (c.debt_to_equity_ratio - r.debt_to_equity_ratio).toFixed(0);
        const profDiff = (c.roe - r.roe).toFixed(1);

        return [
            { 
                icon: c.current_ratio >= r.current_ratio ? "✅" : "⚠️", 
                title: "유동성(지역비교):", 
                content: c.current_ratio >= r.current_ratio 
                    ? `같은 지역 기업 평균(${avgLiq}%)보다 유동 비율이 ${liqDiff}%p 높아 단기 자금 운용이 매우 원활합니다. 지역 내 경제 변동에도 유연하게 대처할 수 있습니다.`
                    : `지역 평균보다 유동성이 낮습니다. 지역 내 경쟁 기업들에 비해 현금 흐름 관리에 어려움이 있을 수 있으니 단기 부채 상환 계획을 점검해야 합니다.`
            },
            { 
                icon: c.debt_to_equity_ratio <= r.debt_to_equity_ratio ? "✅" : "⚠️", 
                title: "안정성(지역비교):", 
                content: c.debt_to_equity_ratio <= r.debt_to_equity_ratio
                    ? `지역 평균 대비 부채 의존도가 낮아 재무 구조가 탄탄합니다. 지역 금융 환경 변화나 금리 인상 리스크로부터 상대적으로 안전합니다.`
                    : `지역 평균보다 부채 비율이 높습니다(${stabDiff}%p 초과). 지역 내 동종 기업들보다 금융 비용 부담이 클 수 있어 자본 확충이 필요할 수 있습니다.`
            },
            { 
                icon: c.roe >= r.roe ? "✅" : "⚠️", 
                title: "수익성(지역비교):", 
                content: c.roe >= r.roe
                    ? `해당 지역 내에서 높은 자본 효율성을 보여주고 있습니다(ROE +${profDiff}%p). 지역 경제 상황을 잘 활용하여 높은 수익을 창출하고 있는 우수 기업입니다.`
                    : `지역 평균보다 투자 수익률이 낮습니다. 지역 특성에 맞는 비즈니스 모델 개선이나 비용 효율화 전략이 필요해 보입니다.`
            },
            { 
                icon: c.interest_coverage_ratio >= r.interest_coverage_ratio ? "✅" : "⚠️", 
                title: "활동성(지역비교):", 
                content: c.interest_coverage_ratio >= r.interest_coverage_ratio
                    ? `지역 내 기업들보다 영업이익 대비 이자 감당 능력이 뛰어납니다. 불황기에도 버틸 수 있는 기초 체력이 튼튼합니다.`
                    : `이자 보상 능력이 지역 평균에 미치지 못합니다. 영업 이익을 늘리거나 차입금 규모를 줄여 금융 비용 부담을 완화해야 합니다.`
            },
        ];
    };
    const analysisPoints = getAnalysisText();

    return (
        <div className="bg-[linear-gradient(180deg,rgba(44,44,44,1)_3%,rgba(69,69,69,1)_17%,rgba(102,102,102,1)_69%,rgba(166,166,166,1)_100%)] w-full min-h-screen relative overflow-x-hidden font-sans pb-20">
            
            {/* 1. 헤더 영역 */}
            <div className="pt-20 text-center relative z-10">
                <button 
                    onClick={() => navigate('/dashboard', { state: location.state })}
                    className="absolute top-10 right-10 flex items-center gap-2 text-white text-[25px] hover:text-gray-300 transition-colors font-medium"
                >
                    ← Back
                </button>
                <h1 className="font-normal text-white text-8xl tracking-[-2.40px] leading-[30px] mb-8 font-serif">B.S.B</h1>
                <div className="text-white text-3xl font-semibold tracking-[-0.75px] mb-4 opacity-90">
                    지역 평균과 비교 분석 ({regionData?.regionName || '지역 정보 없음'})
                </div>
                <h2 className="text-white text-6xl font-medium tracking-[-0.75px] mb-12">
                    {selectedCompany.company_name}
                </h2>
            </div>

            {/* 2. 탭 메뉴 */}
            <div className="flex justify-center mb-16 relative z-10">
                <div className="flex rounded-[100px] border border-[#79747e] overflow-hidden shadow-lg bg-black">
                    <button
                        onClick={() => navigate('/dashboard', { state: location.state })}
                        className="px-8 py-3 text-lg font-medium transition-colors bg-black text-white border-r border-[#79747e] hover:bg-gray-900"
                    >
                        일반 분석
                    </button>
                    <button
                        onClick={() => navigate('/industry-compare', { state: location.state })}
                        className="px-8 py-3 text-lg font-medium transition-colors bg-black text-white border-r border-[#79747e] hover:bg-gray-900"
                    >
                        업종 대비
                    </button>
                    <button className="px-8 py-3 text-lg font-medium transition-colors bg-white text-[#1d192b]">
                        지역 대비
                    </button>
                </div>
            </div>

            {/* 3. 메인 콘텐츠 */}
            <div className="max-w-[1400px] mx-auto px-4 relative z-10 flex flex-col gap-16">
                
                {/* 차트 섹션 */}
                <div className="relative w-full max-w-[1107px] h-[520px] mx-auto bg-[#191e22] rounded-[15px] p-8 shadow-2xl overflow-hidden">
                    <h2 className="text-white text-2xl font-semibold text-center mb-8">
                        기업 vs 지역 평균 지표 비교
                    </h2>
                    <div className="w-full h-[400px]">
                         {regionData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                                    
                                    <XAxis dataKey="name" tick={{ fill: 'white', fontSize: 14, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    
                                    <YAxis 
                                        yAxisId="left" 
                                        orientation="left" 
                                        tick={{ fill: 'white' }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <YAxis 
                                        yAxisId="right" 
                                        orientation="right" 
                                        tick={{ fill: '#ffa500' }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />

                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.1)'}}
                                        contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px', color: 'white' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                    
                                    <Bar yAxisId="left" name="선택한 기업" dataKey="선택기업_L" fill="#1717ff" radius={[10, 10, 0, 0]} barSize={40} />
                                    <Bar yAxisId="left" name="지역 평균" dataKey="지역평균_L" fill="#c0c0c0" radius={[10, 10, 0, 0]} barSize={40} />

                                    <Bar yAxisId="right" name="선택한 기업" dataKey="선택기업_R" fill="#1717ff" radius={[10, 10, 0, 0]} barSize={40} legendType="none" />
                                    <Bar yAxisId="right" name="지역 평균" dataKey="지역평균_R" fill="#c0c0c0" radius={[10, 10, 0, 0]} barSize={40} legendType="none" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex items-center justify-center h-full text-gray-500">데이터 로딩 실패</div>
                        )}
                    </div>
                </div>

                {/* 분석 카드 섹션 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[800px] mx-auto">
                    {analysisCards.map(card => (
                        <AnalysisCard key={card.id} {...card} />
                    ))}
                </div>

                {/* 심층 분석 텍스트 섹션 */}
                <div className="relative w-full max-w-[1082px] mx-auto min-h-[200px] bg-white rounded-[10px] shadow-lg p-8 flex items-center">
                     <div className="w-full">
                        <h3 className="text-center text-[22px] font-medium mb-6">지표별 심층 분석 (지역 기준)</h3>
                        <div className="space-y-4">
                            {analysisPoints.map((point, idx) => (
                                <p key={idx} className="text-[15px] text-black leading-relaxed">
                                    <span className="mr-2">{point.icon}</span>
                                    <span className="font-bold mr-1 text-lg">{point.title}</span>
                                    {point.content}
                                </p>
                            ))}
                        </div>
                     </div>
                </div>

            </div>
        </div>
    );
};