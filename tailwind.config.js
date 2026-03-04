/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
theme: {
  extend: {
    perspective: {
      'none': 'none',
      '500': '500px',
    },
    backfaceVisibility: {
      hidden: 'hidden',
    },
  },
},
  plugins: [],
}