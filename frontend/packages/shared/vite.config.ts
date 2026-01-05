import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        types: resolve(__dirname, "src/types/index.ts"),
        api: resolve(__dirname, "src/api/index.ts"),
        socket: resolve(__dirname, "src/socket/index.ts"),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["socket.io-client", "axios", "rxjs"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
    sourcemap: true,
    target: "es2020",
  },
});
