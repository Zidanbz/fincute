import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cute: {
          blue: "#A5D8FF",
          purple: "#C7B9FF",
          mint: "#B7F0D8",
          pink: "#FFC8DD",
          navy: "#1E2A47",
        },
        muted: {
          DEFAULT: "#F4F6FB",
          foreground: "#6B7280",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(142, 150, 185, 0.15)",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "var(--font-sans)"],
      },
    },
  },
  plugins: [animate],
};

export default config;
