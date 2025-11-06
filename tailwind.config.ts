import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced soft pink palette
        pink: {
          25: '#FEF7FB',    // Softest pink for backgrounds
          50: '#FCEEF6',    // Very light pink
          100: '#F9D9EB',   // Light pink
          150: '#F5C4E0',   // Soft light pink
          200: '#F1AFD5',   // Pastel pink
          250: '#ED9ACA',   // Soft medium pink
          300: '#E985BF',   // Medium pink
          350: '#E570B4',   // Warm medium pink
          400: '#E15BA9',   // Soft bright pink
          450: '#DD469E',   // Bright pink
          500: '#D93193',   // Primary soft pink
          550: '#C52984',   // Medium dark pink
          600: '#B12175',   // Dark pink
          650: '#9D1966',   // Deep pink
          700: '#891157',   // Very deep pink
          750: '#750948',   // Dark rose
          800: '#610239',   // Very dark pink
          850: '#4D012A',   // Darkest pink
          900: '#39001B',   // Ultra dark pink
        },
        // Soft neutral palette
        neutral: {
          25: '#FFFBFC',    // Warm white
          50: '#FEF7F8',    // Very light warm gray
          100: '#FAF1F2',   // Light warm gray
          150: '#F5EBEC',   // Soft light gray
          200: '#F0E5E6',   // Light warm gray
          250: '#EADFE1',   // Soft gray
          300: '#E5D9DC',   // Medium light gray
          350: '#D0C5C8',   // Medium gray
          400: '#BBB1B4',   // Gray
          450: '#A69D9F',   // Medium dark gray
          500: '#91898A',   // Dark gray
          550: '#7C7576',   // Darker gray
          600: '#676161',   // Dark warm gray
          650: '#524C4D',   // Very dark gray
          700: '#3D3738',   // Ultra dark gray
          750: '#282223',   // Almost black
          800: '#130D0E',   // Very dark
          850: '#0E090A',   // Near black
          900: '#090505',   // Black
        },
        // Soft accent colors
        rose: '#E15BA9',    // Soft rose accent
        blush: '#F5C4E0',   // Soft blush
        coral: '#F194A0',   // Soft coral
        sage: '#A8D5BA',    // Soft sage green
        cream: '#F9F3E9',   // Warm cream
      },
      fontFamily: {
        sans: ['var(--font-noto-sans)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'var(--font-noto-sans)', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'pink': '0 10px 30px -5px rgba(255, 20, 147, 0.3)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
