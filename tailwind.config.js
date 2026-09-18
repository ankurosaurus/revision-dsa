/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base Warm Graphite System
        graphite: {
          DEFAULT: '#14171F',
          50: '#F6F5F2',
          100: '#E7E5DF',
          200: '#D2D0C7',
          300: '#9AA0AE',
          400: '#656B7B',
          500: '#434959',
          600: '#2C3140', // Hairline border
          700: '#242938', // Hover surface
          800: '#1C202B', // Elevated card / surface
          900: '#14171F', // Base background
          950: '#0E1118',
        },
        surface: {
          DEFAULT: '#1C202B',
          hover: '#242938',
          subtle: '#171B24',
          border: '#2C3140',
        },
        paper: {
          primary: '#E7E5DF',
          secondary: '#9AA0AE',
          muted: '#656B7B',
          line: '#2C3140',
        },
        // Functional Accent 1: Teal (Mastered / Growth / Correct Recall)
        teal: {
          DEFAULT: '#4F9C8D',
          hover: '#43887B',
          subtle: 'rgba(79, 156, 141, 0.12)',
          border: 'rgba(79, 156, 141, 0.3)',
          50: '#F0F9F7',
          100: '#E0F2EE',
          200: '#C1E6DD',
          300: '#95D1C3',
          400: '#6BBBAA',
          500: '#4F9C8D',
          600: '#3D7F72',
          700: '#2F6258',
          800: '#22463F',
          900: '#162C27',
          950: '#0C1A17',
        },
        // Functional Accent 2: Ochre (Due / Needs-Attention / Streak / Urgency)
        ochre: {
          DEFAULT: '#C98A3B',
          hover: '#B5792F',
          subtle: 'rgba(201, 138, 59, 0.12)',
          border: 'rgba(201, 138, 59, 0.3)',
          50: '#FDF8F0',
          100: '#F9EEDC',
          200: '#F1DCB8',
          300: '#E5C48D',
          400: '#D7A762',
          500: '#C98A3B',
          600: '#A9702B',
          700: '#84541E',
          800: '#5F3B14',
          900: '#3D250B',
          950: '#241404',
        },
        // Neutral mapping for backward compatibility with component classes
        neutral: {
          50: '#F6F5F2',
          100: '#E7E5DF',
          200: '#D2D0C7',
          300: '#B8BAC4',
          400: '#9AA0AE',
          500: '#757C8C',
          600: '#4A5060',
          700: '#2C3140',
          800: '#1C202B',
          900: '#14171F',
          950: '#0E1118',
        },
        dark: {
          bg: '#14171F',
          surface: '#1C202B',
          surfaceHover: '#242938',
          border: '#2C3140',
          borderSubtle: '#222735',
          textMuted: '#9AA0AE',
          textHeading: '#E7E5DF',
        },
        // Brand mapped directly to functional Teal for any lingering references
        brand: {
          50: '#F0F9F7',
          100: '#E0F2EE',
          200: '#C1E6DD',
          300: '#95D1C3',
          400: '#6BBBAA',
          500: '#4F9C8D',
          600: '#4F9C8D',
          700: '#43887B',
          800: '#3D7F72',
          900: '#2F6258',
          950: '#162C27',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Work Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.3)',
        'deck-1': '0 4px 0 0 #181C26, 0 5px 0 0 #2C3140',
        'deck-2': '0 4px 0 0 #181C26, 0 5px 0 0 #2C3140, 0 8px 0 0 #14171F, 0 9px 0 0 #2C3140',
        'elevated': '0 12px 36px -6px rgba(0, 0, 0, 0.45)',
      },
      borderRadius: {
        'card': '12px',
        'inner': '8px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
