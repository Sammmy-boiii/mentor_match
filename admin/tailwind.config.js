/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#3B82F6',
        tertiary: '#10B981',
        deep: '#1E3A8A',
        light: '#F3F4F6',
        gray: {
          10: '#F9FAFB',
          20: '#F3F4F6',
          30: '#E5E7EB',
          50: '#9CA3AF',
          90: '#111827',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui'],
      },
    },
    screens: {
      xs: '480px',
      ...require('tailwindcss/defaultTheme').screens, // keep default sm, md, lg, xl
    },
  },
  safelist: [
    // ✅ Safelist arbitrary text sizes for @apply
    'text-[28px]',
    'md:text-[28px]',
    'text-[35px]',
    'md:text-[35px]',
    'text-[49px]',
    'md:text-[49px]',
  ],
  plugins: [],
}
