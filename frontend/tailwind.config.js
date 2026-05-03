/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#8aa8ff',
          400: '#5578ff',
          500: '#3352f5',
          600: '#1f35dc',
          700: '#1a28b8',
          800: '#1c2694',
          900: '#1c2575',
        },
        surface: {
          0: '#ffffff',
          1: '#f8f9fc',
          2: '#f1f3f8',
          3: '#e8ecf4',
        },
        ink: {
          900: '#0d0f1a',
          700: '#2d3150',
          500: '#5a6080',
          300: '#9ba3c0',
          100: '#d4d8ea',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
