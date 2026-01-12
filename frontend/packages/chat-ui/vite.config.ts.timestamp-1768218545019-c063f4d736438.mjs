// vite.config.ts
import react from "file:///Users/hsshin-rsupport/ghq/github.com/4sizn/animal-zoom/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { defineConfig } from "file:///Users/hsshin-rsupport/ghq/github.com/4sizn/animal-zoom/frontend/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/hsshin-rsupport/ghq/github.com/4sizn/animal-zoom/frontend/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/hsshin-rsupport/ghq/github.com/4sizn/animal-zoom/frontend/packages/chat-ui";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/**/*"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/__tests__/**"],
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.tsx"),
      name: "ChatUI",
      fileName: (format) => `index.${format === "es" ? "js" : "umd.js"}`,
      formats: ["es", "umd"]
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "zustand",
        "@animal-zoom/shared",
        /^@animal-zoom\/shared\//
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          zustand: "zustand",
          "@animal-zoom/shared": "AnimalZoomShared"
        }
      }
    },
    sourcemap: true,
    target: "es2020"
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaHNzaGluLXJzdXBwb3J0L2docS9naXRodWIuY29tLzRzaXpuL2FuaW1hbC16b29tL2Zyb250ZW5kL3BhY2thZ2VzL2NoYXQtdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9oc3NoaW4tcnN1cHBvcnQvZ2hxL2dpdGh1Yi5jb20vNHNpem4vYW5pbWFsLXpvb20vZnJvbnRlbmQvcGFja2FnZXMvY2hhdC11aS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvaHNzaGluLXJzdXBwb3J0L2docS9naXRodWIuY29tLzRzaXpuL2FuaW1hbC16b29tL2Zyb250ZW5kL3BhY2thZ2VzL2NoYXQtdWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgZHRzKHtcbiAgICAgIGluY2x1ZGU6IFtcInNyYy8qKi8qXCJdLFxuICAgICAgZXhjbHVkZTogW1wic3JjLyoqLyoudGVzdC50c1wiLCBcInNyYy8qKi8qLnRlc3QudHN4XCIsIFwic3JjLyoqL19fdGVzdHNfXy8qKlwiXSxcbiAgICAgIHJvbGx1cFR5cGVzOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9pbmRleC50c3hcIiksXG4gICAgICBuYW1lOiBcIkNoYXRVSVwiLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdCA9PT0gXCJlc1wiID8gXCJqc1wiIDogXCJ1bWQuanNcIn1gLFxuICAgICAgZm9ybWF0czogW1wiZXNcIiwgXCJ1bWRcIl0sXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1xuICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgIFwicmVhY3QtZG9tXCIsXG4gICAgICAgIFwienVzdGFuZFwiLFxuICAgICAgICBcIkBhbmltYWwtem9vbS9zaGFyZWRcIixcbiAgICAgICAgL15AYW5pbWFsLXpvb21cXC9zaGFyZWRcXC8vLFxuICAgICAgXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgcmVhY3Q6IFwiUmVhY3RcIixcbiAgICAgICAgICBcInJlYWN0LWRvbVwiOiBcIlJlYWN0RE9NXCIsXG4gICAgICAgICAgenVzdGFuZDogXCJ6dXN0YW5kXCIsXG4gICAgICAgICAgXCJAYW5pbWFsLXpvb20vc2hhcmVkXCI6IFwiQW5pbWFsWm9vbVNoYXJlZFwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICB0YXJnZXQ6IFwiZXMyMDIwXCIsXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFhLE9BQU8sV0FBVztBQUN2YixTQUFTLGVBQWU7QUFDeEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBSGhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNGLFNBQVMsQ0FBQyxVQUFVO0FBQUEsTUFDcEIsU0FBUyxDQUFDLG9CQUFvQixxQkFBcUIscUJBQXFCO0FBQUEsTUFDeEUsYUFBYTtBQUFBLElBQ2YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxrQ0FBVyxlQUFlO0FBQUEsTUFDekMsTUFBTTtBQUFBLE1BQ04sVUFBVSxDQUFDLFdBQVcsU0FBUyxXQUFXLE9BQU8sT0FBTyxRQUFRO0FBQUEsTUFDaEUsU0FBUyxDQUFDLE1BQU0sS0FBSztBQUFBLElBQ3ZCO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsVUFDYixTQUFTO0FBQUEsVUFDVCx1QkFBdUI7QUFBQSxRQUN6QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
