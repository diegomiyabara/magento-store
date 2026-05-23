/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1d4ed8',
          soft:    '#93c5fd',
          muted:   'rgba(29,78,216,0.10)',
        },
        accent: {
          DEFAULT: '#f97316',
          muted:   'rgba(249,115,22,0.10)',
        },
        surface: {
          DEFAULT: '#ffffff',
          strong:  '#f8fafc',
          border:  '#e2e8f0',
        },
        text: {
          DEFAULT: '#1e293b',
          muted:   '#64748b',
          soft:    '#94a3b8',
        },
        danger:  '#dc2626',
        success: '#16a34a',
        bg: {
          base: '#f1f5f9',
          deep: '#f8fafc',
          dark: '#0f172a',
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
        card: '0 4px 24px rgba(0,0,0,0.08)',
        soft: '0 2px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
