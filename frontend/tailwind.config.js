/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ff8d3a',
          soft:    '#ffd4b5',
          muted:   'rgba(255,141,58,0.12)',
        },
        accent: {
          DEFAULT: '#4ba7ff',
          muted:   'rgba(75,167,255,0.12)',
        },
        surface: {
          DEFAULT: 'rgba(11,21,35,0.82)',
          strong:  'rgba(18,32,52,0.96)',
          border:  'rgba(255,255,255,0.08)',
        },
        text: {
          DEFAULT: '#f3efe8',
          muted:   '#98a8ba',
          soft:    '#c8d4e2',
        },
        danger:  '#ff6b6b',
        success: '#4ade80',
        bg: {
          base: '#050913',
          deep: '#09192c',
          dark: '#090d16',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        card: '1.5rem',
        pill: '999px',
      },
      boxShadow: {
        card: '0 20px 60px rgba(0,0,0,0.3)',
        soft: '0 8px 24px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
