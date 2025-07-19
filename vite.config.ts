import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
   server: {
    port: 5175,  // Set a custom port (e.g., 5175)
    host: "0.0.0.0",  // Allow external connections (required for Nginx proxying)
  },
});
