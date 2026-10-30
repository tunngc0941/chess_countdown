/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        crimson: '#b91c1c',
        charcoal: '#121417',
        bronze: '#edc98b',
      },
    },
  },
  plugins: [],
};
