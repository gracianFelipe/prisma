import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens semânticos via CSS vars — claro/escuro vivem em globals.css
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          dim: "rgb(var(--paper-dim) / <alpha-value>)",
          mute: "rgb(var(--paper-mute) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
          dim: "rgb(var(--accent-dim) / <alpha-value>)",
        },
        rule: "rgb(var(--paper) / 0.10)",
      },
      fontFamily: {
        serif: ['"GT Sectra"', '"Times New Roman"', "Georgia", "serif"],
        sans: ['"Inter"', '"Helvetica Neue"', "Arial", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Courier New"', "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        eyebrow: "0.22em",
      },
      maxWidth: {
        editorial: "84rem",
        prose: "38rem",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        fade: "fade 1.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
