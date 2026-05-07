/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jake-purple': '#7525ab',
        'jake-green': '#159b42',
        'jake-cyan': '#00f2ff',
        'jake-dark': '#111111',
      }
    },
  },
  plugins: [],
}
