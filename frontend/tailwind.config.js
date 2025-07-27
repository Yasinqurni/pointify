import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        almarai : ["Almarai", "sans-serif"],
        notoSans : ["Noto Sans", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;