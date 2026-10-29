/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitbox: {
          steel: '#3368A0',       // Deep Steel Blue (Primary / Nav)
          glacier: '#66A3BF',     // Glacier Sky Blue (Secondary / Gauges)
          seafoam: '#C8DFDB',     // Soft Seafoam Mint (Highlight / Soft Panels)
          cream: '#F7F6F2',       // Light Alabaster Cream (Minimalist Canvas)
          dark: '#1C2E42',        // Deep Slate Dark
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
