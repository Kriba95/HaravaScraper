/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.{html,js}', // Kaikki HTML- ja JS-tiedostot
    '!./node_modules/**', // Sulje pois node_modules-hakemisto
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
