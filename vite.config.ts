import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import autoprefixer from "autoprefixer";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [
    mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
    vanillaExtractPlugin(),
    reactRouter(),
  ],
});
