const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: channel('primary'), foreground: channel('primary-foreground') },
        secondary: { DEFAULT: channel('secondary'), foreground: channel('secondary-foreground') },
        accent: channel('accent'),
        background: channel('background'),
        surface: channel('surface'),
        foreground: channel('foreground'),
        muted: channel('muted'),
        border: channel('border'),
        success: channel('success'),
        warning: channel('warning'),
        error: channel('error')
      },
      borderRadius: {
        theme: 'var(--radius)'
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'Tahoma', 'system-ui', 'sans-serif']
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.6)', opacity: '0' }
        },
        'scroll-dot': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(12px)', opacity: '0' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scroll-dot': 'scroll-dot 1.6s ease-in-out infinite',
        'spin-slow': 'spin-slow 7s linear infinite'
      }
    }
  },
  plugins: []
};