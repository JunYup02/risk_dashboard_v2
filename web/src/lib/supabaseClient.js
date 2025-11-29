// web/src/lib/supabaseClient.js

/**
 * [supabaseClient.js]
 * 프론트엔드(React)와 백엔드 데이터베이스(Supabase)를 연결하는 설정 파일입니다.
 * 이 파일에서 생성한 'supabase' 객체를 통해 앱 전체에서 DB 데이터를 조회하거나 저장할 수 있습니다.
 */

// 1. Supabase 라이브러리에서 클라이언트 생성 함수(createClient)를 가져옵니다.
// 이 함수가 있어야 Supabase와 통신할 수 있는 객체를 만들 수 있습니다.
import { createClient } from '@supabase/supabase-js'

// 2. 환경 변수(.env)에서 Supabase 연결 정보(URL, API Key)를 가져옵니다.
// Vite 프로젝트에서는 'process.env' 대신 'import.meta.env'를 사용합니다.
// 보안을 위해 키 값은 코드에 직접 적지 않고 .env 파일에 숨겨둡니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL       // 내 Supabase 프로젝트 주소
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY // 익명(public) API 키

// 3. [안전 장치] 필수 설정값이 제대로 있는지 확인합니다.
// 만약 .env 파일을 만들지 않았거나 키 값이 비어있다면 에러를 발생시켜 개발자에게 알립니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing in .env file');
}

// 4. Supabase 클라이언트 인스턴스를 생성하고 내보냅니다(export).
// 이제 다른 파일(예: DashboardPage.jsx)에서 'import { supabase } ...'로 불러와서
// DB 쿼리(select, insert 등)를 실행할 수 있습니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)