/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          active: '#1E40AF',
          soft: '#EFF6FF',
        },
        secondary: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          soft: '#F0FDFA',
        },
        success: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          soft: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          soft: '#FFFBEB',
        },
        error: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          soft: '#FEF2F2',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(15, 23, 42, 0.08)',
        md: '0 4px 12px rgba(15, 23, 42, 0.10)',
        lg: '0 10px 24px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
