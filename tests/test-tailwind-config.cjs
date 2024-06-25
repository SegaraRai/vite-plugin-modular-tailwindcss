/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  corePlugins: {
    preflight: false,
  },
  plugins: [
    {
      handler: ({ addBase, addComponents, addUtilities }) => {
        for (let i = 1; i <= 9; i++) {
          addBase({
            [`.test-b-${i}`]: {
              "--test-b": `${i}px`,
            },
          });
          addComponents({
            [`.test-c-${i}`]: {
              "--test-c": `${i}px`,
            },
          });
          addUtilities({
            [`.test-u-${i}`]: {
              "--test-u": `${i}px`,
            },
          });
        }
      },
    },
  ],
};
