import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { readFileSync } from "fs";
import rehypeKatex from "rehype-katex";
import rehypeMermaid from "rehype-mermaid";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";

import { createFavicon } from "./createFavicon";
import faviconsPlugin from "./faviconsPlugin";

export default defineConfig({
  plugins: [
    tailwindcss(),
    mdx({
      remarkPlugins: [remarkMath, remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypeMermaid,
          {
            mermaidConfig: {
              theme: "default",
              flowchart: {
                subGraphTitleMargin: { top: 3, bottom: 5 },
              },
              themeVariables: {
                fontFamily: "var(--font-mono)",
                lineColor: "var(--palette-mermaid-line-color)",
                nodeBorder:
                  "var(--palette-mermaid-flowchart-node-border-color)",
                clusterBkg:
                  "var(--palette-mermaid-flowchart-cluster-background-color)",
                clusterBorder:
                  "var(--palette-mermaid-flowchart-cluster-border-color)",
              },
              themeCSS: `
                .node rect { rx: 2px; }
                .cluster rect { rx: 2px; }
                .node.database .label div {
                  translate: 1px -2px;
                }
                .cluster-label .nodeLabel {
                  opacity: 0.7;
                  color: var(--palette-mermaid-flowchart-cluster-label-color);
                }
                g.edgeLabel {
                  backdrop-filter: blur(8px);
                  .labelBkg {
                    border-radius: 3px;
                    padding: 0px 3px;
                    background-color: var(--palette-mermaid-flowchart-edge-label-background-color);
                  }
                  span.edgeLabel {
                    background-color: transparent;
                    p {
                      background-color: transparent;
                      color: var(--palette-mermaid-flowchart-edge-label-color);
                    }
                  }
                }
              `,
            },
          } satisfies Parameters<typeof rehypeMermaid>[0],
        ],
        [
          rehypePrettyCode,
          {
            theme: JSON.parse(readFileSync("./kay-theme-dark.json", "utf-8")),
          } satisfies Parameters<typeof rehypePrettyCode>[0],
          ,
        ],
      ],
    }),
    vanillaExtractPlugin(),
    reactRouter(),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"], // if you use TypeScript
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              compilationMode: "infer",
            },
          ],
        ],
      },
    }),
    faviconsPlugin(createFavicon(), {
      background: "#000000",
      appName: "KUBE",
      path: "/favicons",
    }),
  ],
});
