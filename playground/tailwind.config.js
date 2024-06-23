const { iconsPlugin } = require("@egoist/tailwindcss-icons");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**", "*.html"],
  plugins: [iconsPlugin()],
};
