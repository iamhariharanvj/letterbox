/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'post-red': '#DC2626',
        'post-blue': '#1E40AF',
        'post-green': '#059669',
        'paper-white': '#FEFEFE',
        'envelope-brown': '#8B4513',
        'stamp-gold': '#D97706',
      },
      animation: {
        'fold': 'fold 1s ease-in-out',
        'stamp': 'stamp 0.5s ease-in-out',
        'envelope-open': 'envelopeOpen 0.8s ease-in-out',
        'letter-drop': 'letterDrop 0.6s ease-in-out',
        'postbox-shake': 'postboxShake 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
      },
      keyframes: {
        fold: {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(180deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        envelopeOpen: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        letterDrop: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)' },
          '100%': { transform: 'translateY(0) rotate(0deg)' },
        },
        postboxShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 