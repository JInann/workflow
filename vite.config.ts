// @ts-nocheck
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
export default defineConfig(async ({ mode }) => {
  return {
    root: resolve(__dirname, "src/pages/index/"),
    base: "./",
    publicDir: resolve(__dirname, "public"),
    server: {
      open: "/index.html",
    },
    assetsInclude: ["**/*.svga"],
    envDir: resolve(__dirname),
    plugins: [vue()],
    build: {
      target: "es2015",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/pages/index/index.html"),
        },
      },
      outDir: resolve(__dirname, mode == "pre" ? "pre" : "dist"),
      emptyOutDir: true,
    },
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
    },
  };
});
