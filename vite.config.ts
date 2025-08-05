import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/main.ts",
      output: {
        format: "es",
        entryFileNames: "main.js",
      },
    },
  },
});
