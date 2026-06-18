/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink:   '#FFD6E0',
          peach:  '#FFECCC',
          yellow: '#FFF9C4',
          green:  '#D4EDDA',
          blue:   '#D0EBFF',
          purple: '#E8DAFF',
          brown:  '#C8A882',
          cream:  '#FFF8F0',
        },
        brand: {
          primary:   '#FF8C69',
          secondary: '#FFB347',
          accent:    '#87CEEB',
          dark:      '#5C4033',
          light:     '#FFF8F0',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
