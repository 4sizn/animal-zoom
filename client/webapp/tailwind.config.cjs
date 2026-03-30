module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: ["bg-primary", "grid"],
  theme: {
    extend: {
      colors: {
        // Editorial Modularism - Surface Hierarchy
        "surface": "#0e0e0e",
        "surface-dim": "#0e0e0e",
        "surface-bright": "#2c2c2c",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#131313",
        "surface-container": "#1a1a1a",
        "surface-container-high": "#20201f",
        "surface-container-highest": "#262626",
        "surface-variant": "#262626",
        // Editorial Modularism - Primary (Safety Orange)
        "primary": "#ff9062",
        "primary-dim": "#ff7434",
        "primary-fixed": "#ff793d",
        "primary-fixed-dim": "#fa6314",
        "primary-container": "#ff793d",
        "on-primary": "#561b00",
        "on-primary-fixed": "#000000",
        "on-primary-fixed-variant": "#521a00",
        "on-primary-container": "#431300",
        "surface-tint": "#ff9062",
        // Editorial Modularism - Secondary
        "secondary": "#f48639",
        "secondary-dim": "#ed8134",
        "secondary-container": "#984700",
        "secondary-fixed": "#ffc5a4",
        "secondary-fixed-dim": "#ffb283",
        "on-secondary": "#411a00",
        "on-secondary-container": "#fff6f2",
        "on-secondary-fixed": "#582600",
        "on-secondary-fixed-variant": "#833c00",
        // Editorial Modularism - Tertiary
        "tertiary": "#ffba4b",
        "tertiary-dim": "#e69c05",
        "tertiary-container": "#f6aa1d",
        "tertiary-fixed": "#f6aa1d",
        "tertiary-fixed-dim": "#e69c05",
        "on-tertiary": "#593a00",
        "on-tertiary-container": "#4d3100",
        "on-tertiary-fixed": "#2f1d00",
        "on-tertiary-fixed-variant": "#583900",
        // Editorial Modularism - Neutral
        "background": "#0e0e0e",
        "on-background": "#ffffff",
        "on-surface": "#ffffff",
        "on-surface-variant": "#adaaaa",
        "outline": "#767575",
        "outline-variant": "#484847",
        "inverse-surface": "#fcf9f8",
        "inverse-on-surface": "#565555",
        "inverse-primary": "#a63c00",
        // Editorial Modularism - Error
        "error": "#ff716c",
        "error-dim": "#d7383b",
        "error-container": "#9f0519",
        "on-error": "#490006",
        "on-error-container": "#ffa8a3",
        // Legacy colors (keep for backward compatibility)
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
        body: ["Inter", "sans-serif"],
        headline: ["Manrope", "Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      aspectRatio: {
        video: "16 / 9"
      }
    }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")]
};
