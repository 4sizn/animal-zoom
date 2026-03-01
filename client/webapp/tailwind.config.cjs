module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: ["bg-primary", "grid"],
  theme: {
    extend: {
      colors: {
        primary: "#EF4444",
        "background-light": "#F3F4F6",
        "background-dark": "#202124",
        "surface-light": "#FFFFFF",
        "surface-dark": "#27272A",
        charcoal: "#1A1A1A",
        "charcoal-dark": "#181A1D",
        "charcoal-light": "#202327",
        "control-bg": "#2D3136",
        "control-bg-translucent": "rgba(60, 64, 67, 0.9)",
        "overlay-plate": "rgba(0, 0, 0, 0.4)",
        "tile-bg": "#2C2C2C"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Quicksand", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "3rem"
      },
      aspectRatio: {
        video: "16 / 9"
      }
    }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")]
};
