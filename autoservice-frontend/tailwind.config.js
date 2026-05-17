/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a1a',
        'bg-secondary': '#0f0f2e',
        'bg-card': 'rgba(139, 92, 246, 0.05)',
        'violet-neon': '#8b5cf6',
        'violet-light': '#a78bfa',
        'violet-dark': '#6d28d9',
        'blue-accent': '#3b82f6',
        'blue-light': '#60a5fa',
        'emerald-accent': '#10b981',
        'rose-accent': '#f43f5e',
        'amber-accent': '#f59e0b',
      },
      boxShadow: {
        'neon-violet': '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'neon-sm': '0 0 10px rgba(139, 92, 246, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-violet': 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 100%)',
        'mountain-gradient': 'linear-gradient(to top, #1a0533 0%, #0d0d2e 40%, #0a0a1a 100%)',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.8))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.4))' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

