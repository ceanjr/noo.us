import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  vite: {
    build: {
      sourcemap: true,
    },
    server: {
      hmr: true,
      watch: {
        usePolling: false,
      },
    },
  },
  integrations: [react(), tailwind()],
  output: "static",
});
