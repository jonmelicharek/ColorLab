/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        pearl: '#FAF9F7',
        cream: '#F5F0EB',
        sand: '#E8DFD5',
        clay: '#C4B5A5',
        stone: '#8A7E72',
        espresso: '#3D2E1F',
        caramel: '#C8874B',
        honey: '#E5A84B',
        copper: '#B87333',
        rose: '#C4736E',
        ash: '#9E9E9E',
        platinum: '#E5E4E2',
        midnight: '#1A1A2E',
        violet: '#6C5B7B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200, 135, 75, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(200, 135, 75, 0.35)' },
        },
      },
    },
  },
  plugins: [],
};
