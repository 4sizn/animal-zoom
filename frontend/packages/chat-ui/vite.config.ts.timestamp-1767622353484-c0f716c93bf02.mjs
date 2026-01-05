// vite.config.ts

import react from "file:///home/lotus/document/lotus/animal-zoom/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "file:///home/lotus/document/lotus/animal-zoom/frontend/node_modules/vite/dist/node/index.js";
import dts from "file:///home/lotus/document/lotus/animal-zoom/frontend/node_modules/vite-plugin-dts/dist/index.mjs";
import { resolve } from "path";

var __vite_injected_original_dirname =
  "/home/lotus/document/lotus/animal-zoom/frontend/packages/chat-ui";
var vite_config_default = defineConfig({
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
      entry: resolve(__vite_injected_original_dirname, "src/index.tsx"),
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
      "@": resolve(__vite_injected_original_dirname, "src"),
    },
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9sb3R1cy9kb2N1bWVudC9sb3R1cy9hbmltYWwtem9vbS9mcm9udGVuZC9wYWNrYWdlcy9jaGF0LXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9sb3R1cy9kb2N1bWVudC9sb3R1cy9hbmltYWwtem9vbS9mcm9udGVuZC9wYWNrYWdlcy9jaGF0LXVpL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2xvdHVzL2RvY3VtZW50L2xvdHVzL2FuaW1hbC16b29tL2Zyb250ZW5kL3BhY2thZ2VzL2NoYXQtdWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGR0cyh7XG4gICAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qJ10sXG4gICAgICBleGNsdWRlOiBbJ3NyYy8qKi8qLnRlc3QudHMnLCAnc3JjLyoqLyoudGVzdC50c3gnLCAnc3JjLyoqL19fdGVzdHNfXy8qKiddLFxuICAgICAgcm9sbHVwVHlwZXM6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHN4JyksXG4gICAgICBuYW1lOiAnQ2hhdFVJJyxcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXQgPT09ICdlcycgPyAnanMnIDogJ3VtZC5qcyd9YCxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAndW1kJ11cbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICd6dXN0YW5kJywgJ0BhbmltYWwtem9vbS9zaGFyZWQnLCAvXkBhbmltYWwtem9vbVxcL3NoYXJlZFxcLy9dLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICByZWFjdDogJ1JlYWN0JyxcbiAgICAgICAgICAncmVhY3QtZG9tJzogJ1JlYWN0RE9NJyxcbiAgICAgICAgICB6dXN0YW5kOiAnenVzdGFuZCcsXG4gICAgICAgICAgJ0BhbmltYWwtem9vbS9zaGFyZWQnOiAnQW5pbWFsWm9vbVNoYXJlZCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIHRhcmdldDogJ2VzMjAyMCdcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJylcbiAgICB9XG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrWCxTQUFTLG9CQUFvQjtBQUMvWSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZTtBQUh4QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixJQUFJO0FBQUEsTUFDRixTQUFTLENBQUMsVUFBVTtBQUFBLE1BQ3BCLFNBQVMsQ0FBQyxvQkFBb0IscUJBQXFCLHFCQUFxQjtBQUFBLE1BQ3hFLGFBQWE7QUFBQSxJQUNmLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsZUFBZTtBQUFBLE1BQ3pDLE1BQU07QUFBQSxNQUNOLFVBQVUsQ0FBQyxXQUFXLFNBQVMsV0FBVyxPQUFPLE9BQU8sUUFBUTtBQUFBLE1BQ2hFLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxJQUN2QjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFNBQVMsYUFBYSxXQUFXLHVCQUF1Qix5QkFBeUI7QUFBQSxNQUM1RixRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsVUFDYixTQUFTO0FBQUEsVUFDVCx1QkFBdUI7QUFBQSxRQUN6QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
