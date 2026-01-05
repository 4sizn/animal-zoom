import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/**/*"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/__tests__/**"],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.tsx"),
      name: "ChatUI",
      fileName: (format) => `index.${format === "es" ? "js" : "umd.js"}`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "zustand",
        "@animal-zoom/shared",
        /^@animal-zoom\/shared\//,
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          zustand: "zustand",
          "@animal-zoom/shared": "AnimalZoomShared",
        },
      },
    },
    sourcemap: true,
    target: "es2020",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
