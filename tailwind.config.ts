import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        emerald: {
          850: '#044e32',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4efe8',
          200: '#e7ddd0',
          300: '#d4c2b0',
          400: '#ba9f8b',
          500: '#a3816c',
          600: '#8b6955',
          700: '#705244',
          800: '#5c443a',
          900: '#4e3b33',
        },
        amber: {
          550: '#d97706',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        'premium': '0 10px 30px -4px rgba(22, 101, 52, 0.12)',
        'hover': '0 14px 34px -4px rgba(22, 101, 52, 0.18)',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
