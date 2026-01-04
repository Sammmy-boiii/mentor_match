/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#3B82F6',
        tertiary: '#10B981',
        deep: '#1E3A8A',
        light: '#F3F4F6',
        gray:{
          10: '#F9FAFB',
          20: '#F3F4F6',
          30: '#E5E7EB',
          50: '#9CA3AF',
          90: '#111827',
        },
    },
    screens: {
      'xs': '480px',
      // "3xl":"1680px",
      // "4xl":"2200px",
      
    },
    backgroundImage: {
      hero: "url('/src/assets/bg.png')",
    },
  },
  },
  plugins: [],
}