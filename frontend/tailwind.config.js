/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // v2.0 typography scale — elderly-accessible Thai (see docs/DESIGN_SYSTEM.md §6)
        display: ['36px', { lineHeight: '1.25', fontWeight: '700' }],
        h1: ['28px', { lineHeight: '1.35', fontWeight: '700' }],
        h2: ['22px', { lineHeight: '1.4', fontWeight: '700' }],
        h3: ['19px', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.7', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        meta: ['12px', { lineHeight: '1.5', fontWeight: '500' }],
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
          muted: '#64748B',
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
      transitionDuration: {
        fast: '120ms',
        base: '180ms',
        slow: '280ms',
      },
      transitionTimingFunction: {
        enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 280ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 180ms ease-out both',
        'scale-in': 'scale-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
