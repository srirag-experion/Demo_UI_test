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
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#e1fa9b',
          300: '#bef264',
          400: '#a3e635',
          500: '#94d320', // Better AI signature lime
          600: '#84cc16',
          700: '#65a30d',
          800: '#4d7c0f',
          900: '#365314',
        },
        brand: {
          bg: '#f8fafc',
          sidebar: '#ffffff',
          lime: '#94d320',
          limeLight: '#edf8c7',
          limeBorder: '#9bd825',
          limeHover: '#84cc16',
          border: '#e2e8f0',
          textMain: '#1e293b',
          textMuted: '#64748b',
          card: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 2px 6px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'popover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
