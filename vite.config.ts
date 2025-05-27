import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

import { createFavicon } from "./createFavicon";
import faviconsPlugin from "./faviconsPlugin";

export default defineConfig({
  plugins: [
    tailwindcss(),
    mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
    vanillaExtractPlugin(),
    reactRouter(),
    faviconsPlugin(createFavicon(), {
      background: "#000000",
      appName: "KUBE",
      path: "/favicons",
    }),
  ],
});
