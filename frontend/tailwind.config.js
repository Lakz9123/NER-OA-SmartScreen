/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E', // Teal 700
          light: '#14B8A6',
          dark: '#0F766E',
        },
        secondary: {
          DEFAULT: '#DBEAFE', // Soft blue
        },
        risk: {
          low: '#22C55E', // Green
          mod: '#F59E0B', // Amber
          high: '#EF4444', // Red
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.5) drop-shadow(0 0 10px rgba(15, 118, 110, 0.8))' },
        },
        'laser-scan': {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up-delay-1': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
        'fade-in-up-delay-2': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'laser-scan': 'laser-scan 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
