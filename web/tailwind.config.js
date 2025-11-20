/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
        'gujarati': ['Noto Sans Gujarati UI', 'sans-serif'],
        'hebrew': ['Noto Sans Hebrew', 'sans-serif'],
        // 새로 추가된 폰트 변수 연결
        "single-line-body-base": "var(--single-line-body-base-font-family)",
      },
      colors: {
        'gray-custom': 'rgba(170,170,170,1)',
        'dark-custom': 'rgba(68,68,68,1)',
        // 새로 추가된 컬러 변수 연결
        "color-primitives-white-1000": "var(--color-primitives-white-1000)",
        "color-text-default-default": "var(--color-text-default-default)",
      }
    },
  },
  plugins: [],
}