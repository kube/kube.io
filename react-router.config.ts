import type { Config } from "@react-router/dev/config";

import { FLAGS } from "./app/flags.ts";

import fm from "front-matter";
import * as glob from "glob";
import fs from "node:fs";

export const POSTS = glob
  .sync("./app/data/articles/*/article.mdx")
  .map((file) => {
    const post = fs.readFileSync(file, "utf-8");
    return fm(post).attributes as { slug: string };
  });

export default {
  ssr: false,
  async prerender() {
    return [
      "/",
      "/cv",
      "/cv.pdf",
      ...(FLAGS.BLOG
        ? [
            "/blog",
            ...POSTS.map((post) => `/blog/${post.slug}`),
            "/blog/imageResizer",
          ]
        : []),
      ...(FLAGS.WORKSHOP ? ["/workshop"] : []),
    ];
  },
} satisfies Config;
