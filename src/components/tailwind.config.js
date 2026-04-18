/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        profit: '#16a34a',
        loss: '#dc2626',
      },
    },
  },
  plugins: [],
};
