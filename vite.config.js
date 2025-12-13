import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Development mode or preview - run as normal app
  if (command === "serve") {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      define: {
        "process.env.NODE_ENV": JSON.stringify(mode),
      },
    };
  }

  // Build mode - check if we're building the library
  const isLibraryBuild = process.env.BUILD_MODE === "library";

  if (isLibraryBuild) {
    // Library build configuration
    return {
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
      build: {
        lib: {
          entry: path.resolve(__dirname, "src/widget.jsx"),
          name: "TwoCodeChatWidget",
          fileName: (format) => `two-code-chat-widget.${format}.js`,
          formats: ["umd"],
        },
        rollupOptions: {
          external: [],
          output: {
            globals: {},
            inlineDynamicImports: true,
          },
        },
        outDir: "dist-widget",
      },
    };
  }

  // Default app build
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
  };
});
