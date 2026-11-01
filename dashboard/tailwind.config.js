const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        card: v('card'),
        slate: {
          50: v('slate-50'),
          100: v('slate-100'),
          200: v('slate-200'),
          300: v('slate-300'),
          400: v('slate-400'),
          500: v('slate-500'),
          600: v('slate-600'),
          700: v('slate-700'),
          800: v('slate-800'),
          900: v('slate-900')
        },
        brand: {
          50: v('brand-50'),
          100: v('brand-100'),
          200: v('brand-200'),
          300: v('brand-300'),
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      }
    }
  },
  plugins: []
};