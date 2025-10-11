/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',    // ブルー系（信頼感）
        secondary: '#10B981',  // グリーン系（計算ボタン）
        accent: '#F59E0B',     // オレンジ系（アクセント）
      },
      spacing: {
        'calculator': '4.5rem', // 電卓ボタンサイズ
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'sans-serif'],
        mono: ['Roboto', 'SF Pro', 'Noto Sans JP', 'monospace'],
      },
    },
  },
  plugins: [],
}

