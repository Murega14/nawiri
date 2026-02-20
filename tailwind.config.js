/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        forest: {
          DEFAULT: '#1a3a2a',
          mid: '#234d38',
          light: '#2d6349',
        },
        gold: {
          DEFAULT: '#c8992a',
          light: '#e8b84b',
          pale: '#f5e9c8',
        },
        terra: '#b05530',
        cream: {
          DEFAULT: '#faf6ee',
          dark: '#f0e8d5',
        },
        ink: '#0e1f16',
        muted: '#5a7265',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'float-bob': 'floatBob 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatBob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
