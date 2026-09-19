/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Clean Minimalist Restrained System
        bg: {
          DEFAULT: '#FAFAF8',
          soft: '#F4F4F0',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F7F7F5',
          subtle: '#FAFAF8',
          border: '#E5E4E0',
        },
        ink: {
          DEFAULT: '#1C1C1E',
          primary: '#1C1C1E',
          secondary: '#6E6E73',
          muted: '#8E8E93',
          faint: '#C7C7CC',
        },
        line: {
          DEFAULT: '#E5E4E0',
          subtle: '#EFEFEA',
          strong: '#D1D0CB',
        },
        // Single Accent: Quiet, desaturated deep teal-blue (#2D5A6B)
        accent: {
          DEFAULT: '#2D5A6B',
          hover: '#234754',
          subtle: 'rgba(45, 90, 107, 0.08)',
          border: 'rgba(45, 90, 107, 0.25)',
        },
        // Functional quiet/desaturated indicators
        status: {
          easy: '#5A9367',
          medium: '#C4923A',
          hard: '#C25B5B',
          streak: '#C4923A',
        },
        // Backward-compatibility mappings to keep components unbroken
        easy: {
          DEFAULT: '#5A9367',
        },
        medium: {
          DEFAULT: '#C4923A',
        },
        hard: {
          DEFAULT: '#C25B5B',
        },
        elite: {
          DEFAULT: '#C25B5B',
        },
        streak: {
          DEFAULT: '#C4923A',
        },
        teal: {
          DEFAULT: '#2D5A6B',
          hover: '#234754',
        },
        ochre: {
          DEFAULT: '#C4923A',
          hover: '#B08030',
        },
        graphite: {
          DEFAULT: '#1C1C1E',
          base: '#FFFFFF',
          hover: '#F7F7F5',
          hairline: '#E5E4E0',
        },
        paper: {
          DEFAULT: '#FAFAF8',
          primary: '#1C1C1E',
          secondary: '#6E6E73',
          muted: '#8E8E93',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
        serif: ['Geist', 'sans-serif'],
        display: ['Geist', 'sans-serif'],
      },
      fontSize: {
        'meta': ['13px', { lineHeight: '1.6' }],
        'body': ['15px', { lineHeight: '1.6' }],
        'subhead': ['17px', { lineHeight: '1.4' }],
        'h3': ['22px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'h2': ['28px', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'h1': ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'soft': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'modal': '0 12px 36px rgba(0, 0, 0, 0.08)',
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'deck': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'float': '0 4px 16px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        DEFAULT: '10px',
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '10px',
        '2xl': '12px',
        'card': '10px',
      },
      transitionTimingFunction: {
        'minimal': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
