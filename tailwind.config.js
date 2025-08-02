/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        comic: [
          "Comic Sans MS",
          "Comic Sans",
          "Chalkboard SE",
          "Comic Neue",
          "cursive",
        ],
      },
    },
  },
  plugins: [],
};
