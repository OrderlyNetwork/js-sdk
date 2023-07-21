/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,js,tsx,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF6363",
        brand: {
          100: "#535E7B",
        },
      },
      
    },
    // colors:{
    //   primary: '#FF6363',
    // }
  },
  plugins: [require("@tailwindcss/typography")],
};
