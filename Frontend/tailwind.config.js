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
          DEFAULT: '#2D6A4F',
          light: '#40916C',
          xl: '#B7E4C7',
        },
        accent: {
          DEFAULT: '#E76F51',
          light: '#F4A261',
        },
        neutral: {
          900: '#1A1A1A',
          600: '#4A4A4A',
          300: '#C4C4C4',
          100: '#F5F5F0',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        devanagari: ['Tiro Devanagari', 'serif'],
      }
    },
  },
  plugins: [],
}