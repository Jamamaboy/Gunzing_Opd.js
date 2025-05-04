/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'red-custom': '#990000',
        'red-hover': 'rgba(153, 0, 0, 0.8)',
        'CrimsonRed': '#990000',
        'DarkMaroon': '#330000'
      },
    },
  },
  plugins: [],
}