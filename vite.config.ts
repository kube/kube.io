import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import rehypeMermaid from "rehype-mermaid";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

import { createFavicon } from "./createFavicon";
import faviconsPlugin from "./faviconsPlugin";

export default defineConfig({
  plugins: [
    tailwindcss(),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [
        rehypeMermaid,
        [rehypePrettyCode, { theme: "one-dark-pro" }],
      ],
    }),
    vanillaExtractPlugin(),
    reactRouter(),
    faviconsPlugin(createFavicon(), {
      background: "#000000",
      appName: "KUBE",
      path: "/favicons",
    }),
  ],
});
