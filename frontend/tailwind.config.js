/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: '#0a0a0a',
          card: '#121212',
          cardLight: '#1a1a1a',
          gold: '#d4af37',
          goldLight: '#f3e5ab',
          goldDark: '#aa7c11',
          goldGlow: 'rgba(212, 175, 55, 0.35)',
          goldHover: '#e5c048',
        },
        emotion: {
          joy: '#e5c048',      // Golden yellow
          sadness: '#3b82f6',  // Blue glow
          anger: '#ef4444',    // Red glow
          fear: '#a855f7',     // Purple glow
          love: '#ec4899',     // Pink aura
          lonely: '#14b8a6',   // Teal
          stress: '#f97316',   // Orange
          neutral: '#9ca3af'   // Slate gray
        }
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 30px rgba(212, 175, 55, 0.45)',
        'gold-glow-btn': '0 0 12px rgba(212, 175, 55, 0.6)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f3e5ab 0%, #d4af37 50%, #aa7c11 100%)',
        'gold-text-grad': 'linear-gradient(to right, #f3e5ab, #d4af37, #aa7c11)',
        'luxury-radial': 'radial-gradient(circle at center, #1c180a 0%, #050505 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
