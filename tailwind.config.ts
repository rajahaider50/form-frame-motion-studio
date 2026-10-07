import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08080B",
        panel: "#111116",
        violet: "#8C70FF",
        lime: "#D2FA6B",
      },
      fontFamily: {
        display: ["Space Grotesk", "Arial", "sans-serif"],
        body: ["DM Sans", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
