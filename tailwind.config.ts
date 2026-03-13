import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#09090B',
          900: '#0C0C10',
          850: '#111116',
          800: '#18181D',
          700: '#27272F',
          600: '#3F3F49',
        },
        ivory: {
          50: '#FAFAF9',
          100: '#F5F5F0',
          200: '#E8E8E0',
          300: '#D4D4C8',
          400: '#A8A89C',
        },
        amber: {
          DEFAULT: '#D4A054',
          light: '#E8C078',
          muted: 'rgba(212, 160, 84, 0.25)',
          dim: 'rgba(212, 160, 84, 0.12)',
        },
        success: '#4ADE80',
        error: '#F87171',
        info: '#60A5FA',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'mono-md': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
        'mono-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      transitionTimingFunction: {
        glacial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 60px 0px var(--glow-color)' },
          '50%': { boxShadow: '0 0 120px 10px var(--glow-color)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(24px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
