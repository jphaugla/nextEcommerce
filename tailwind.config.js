// const defaultTheme = require("tailwindcss/defaultTheme");
// // tailwind.config.js
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx}",
//     "./components/**/*.{js,ts,jsx,tsx}",
//     "./components/**/subcomponents/*.{js,ts,jsx,tsx}",
//   ],
//   screens: {
//     xs: "350px",
//     ...defaultTheme.screens,
//   },
//   theme: {
//     extend: {},
//   },
//   plugins: [require("tailwind-scrollbar-hide")],
// };

const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./components/**/subcomponents/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Comic Sans MS Italic"'],
      serif: ["Georgia"],
      mono: ["ui-monospace"],
      display: ["Oswald"],
      body: ['"Open Sans"'],
    },
    screens: {
      xxs: "350px",
      xs: "500px",
      ...defaultTheme.screens,
    },
    extend: {},
  },
  plugins: [
    // require("@tailwindcss/aspect-ratio"),
    // require("@tailwindcss/forms"),
    require("tailwind-scrollbar-hide"),
  ],
};
