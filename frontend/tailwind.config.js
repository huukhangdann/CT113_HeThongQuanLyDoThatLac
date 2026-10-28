export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./pages/**/*.{html,js}",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F6F2",
        "deep-sage": "#35483D",
        "soft-black": "#242424",
        "warm-gray": "#777771",
        "stone-border": "#E6E4DE",
      },
      fontFamily: {
        vietnam: ["'Be Vietnam Pro'", "sans-serif"],
      },
    },
  },
  plugins: [],
}