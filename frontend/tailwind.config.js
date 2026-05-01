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
        rams: {
          blue: '#637bff',
          light: '#F5F5F5',
          dark: '#121212',
          border: '#E0E0E0',
          darkBorder: '#2A2A2A'
        }
      }
    },
  },
  plugins: [],
}
