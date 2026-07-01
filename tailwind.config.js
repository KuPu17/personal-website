/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // System palette — neutral + single accent
        canvas: '#0a0a0a',
        surface: '#111111',
        overlay: '#1a1a1a',
        border: '#262626',
        muted: '#404040',
        subtle: '#737373',
        secondary: '#a3a3a3',
        primary: '#e5e5e5',
        bright: '#fafafa',
        // Accent: electric indigo — deliberate, not cyan/green
        accent: {
          DEFAULT: '#6366f1',
          dim: '#4f52cc',
          glow: 'rgba(99,102,241,0.15)',
        },
        // Semantic
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        'glow-accent': '0 0 0 1px rgba(99,102,241,0.4), 0 0 20px rgba(99,102,241,0.1)',
        'surface': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
        'lift': '0 4px 16px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.96)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: 0, transform: 'translateX(100%)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#a3a3a3',
            maxWidth: 'none',
            a: { color: '#6366f1', textDecoration: 'none' },
            'h1,h2,h3,h4': { color: '#fafafa', fontWeight: '600' },
            code: {
              color: '#e5e5e5',
              backgroundColor: '#1a1a1a',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.875em',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              backgroundColor: '#111111',
              border: '1px solid #262626',
              borderRadius: '10px',
            },
            blockquote: {
              borderLeftColor: '#6366f1',
              color: '#737373',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
