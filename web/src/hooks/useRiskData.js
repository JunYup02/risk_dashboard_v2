/**
 * [useRiskData.js]
 * 기업의 재무 위험 데이터(부채비율, 유동비율, Z-Score 등)를 
 * Supabase 데이터베이스에서 가져오는 '커스텀 훅(Custom Hook)'입니다.
 * * * [왜 따로 만들었나요?]
 * 여러 페이지에서 비슷한 데이터를 필요로 할 때, 매번 코드를 복사/붙여넣기 하는 대신
 * 이 훅(useRiskData)만 불러오면(import) 쉽게 데이터를 사용할 수 있기 때문입니다.
 */

import { useEffect, useState } from 'react';
// 우리가 만든 Supabase 연결 객체를 가져옵니다.
import { supabase } from '../lib/supabaseClient';

export const useRiskData = () => {
  /* --- [상태 관리 변수들] --- */
  // 1. data: DB에서 가져온 실제 데이터를 저장할 곳 (초기값: 빈 배열)
  const [data, setData] = useState([]);
  
  // 2. loading: 데이터를 가져오는 중인지 표시 (초기값: true - 로딩 중)
  const [loading, setLoading] = useState(true);
  
  // 3. error: 만약 에러가 나면 에러 내용을 저장할 곳 (초기값: null - 에러 없음)
  const [error, setError] = useState(null);

  /* --- [데이터 가져오기 (Fetch)] --- */
  // useEffect(() => { ... }, []): 이 훅을 사용하는 컴포넌트가 처음 화면에 나타날 때 딱 한 번 실행됩니다.
  useEffect(() => {
    // 비동기 함수(async)를 내부에 정의하여 실행합니다.
    const fetchData = async () => {
      try {
        setLoading(true); // 로딩 시작 알림
        
        // --- [Supabase 쿼리 작성] ---
        // financial_reports 테이블에서 데이터를 가져오되, companies 테이블과 연결(Join)합니다.
        const { data: result, error } = await supabase
          .from('financial_reports') // 1. 메인 테이블 선택
          .select(`
            stock_code,
            period,
            current_ratio,
            debt_to_equity_ratio,
            altman_z_score,
            companies (          -- 2. 외래키(Foreign Key)로 연결된 기업 정보도 함께 가져옴
              company_name,
              industry,
              market_cap_recent
            )
          `)
          // 3. 필터링: 부채비율 데이터가 없는 행은 제외 (Null 값 제거)
          .not('debt_to_equity_ratio', 'is', null)
          
          // 4. 정렬: 부채비율이 낮은 순서대로 정렬 (안전한 기업부터 보기 위함)
          .order('debt_to_equity_ratio', { ascending: true }) 
          
          // 5. 제한: 데이터가 너무 많으면 느려지므로 상위 20개만 가져옴
          .limit(20); 

        // 만약 DB에서 에러를 반환하면 예외를 던짐
        if (error) throw error;
        
        // 성공적으로 가져온 데이터를 상태에 저장
        setData(result || []);
        
      } catch (err) {
        // 에러 발생 시 콘솔에 출력하고 상태에 저장
        console.error('Error fetching risk data:', err);
        setError(err);
      } finally {
        // 성공하든 실패하든 작업이 끝났으므로 로딩 상태 해제
        setLoading(false);
      }
    };

    // 위에서 만든 함수 실행
    fetchData();
  }, []); // 의존성 배열이 비어있으므로([]), 이 효과는 마운트 시 1회만 실행됨

  // 컴포넌트에서 사용할 수 있도록 상태들을 반환
  return { data, loading, error };
};