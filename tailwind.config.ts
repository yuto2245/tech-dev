import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f3f5ff",
          100: "#e4e8ff",
          200: "#c3cfff",
          300: "#9aaeff",
          400: "#6f86ff",
          500: "#485dff",
          600: "#2d3fec",
          700: "#2231bc",
          800: "#1d2a92",
          900: "#1b2875"
        }
      }
    }
  },
  plugins: [typography]
};

export default config;
