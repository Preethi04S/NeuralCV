import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
