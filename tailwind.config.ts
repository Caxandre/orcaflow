import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        navy: '#15284b',
        brand: { 50: '#eef5ff', 100: '#d9e9ff', 500: '#3478f6', 600: '#2164db', 700: '#1a4fae' },
        coral: '#ff725e',
      },
      boxShadow: { card: '0 10px 35px rgba(30, 58, 95, .07)' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'], serif: ['Lora', 'Georgia', 'serif'] },
    },
  },
  plugins: [],
} satisfies Config;
