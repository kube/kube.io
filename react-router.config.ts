import type { Config } from "@react-router/dev/config";

import { FLAGS } from "./app/flags.ts";

import fm from "front-matter";
import * as glob from "glob";
import fs from "node:fs";

export const POSTS = glob
  .sync("./app/data/articles/*/article.mdx")
  .map((file) => {
    const post = fs.readFileSync(file, "utf-8");
    return fm(post).attributes as { slug: string; published?: boolean };
  });

export default {
  ssr: false,
  async prerender() {
    return [
      "/",
      "/cv",
      "/cv.pdf",

      "/blog",
      ...POSTS.filter((_) => _.published !== false).map(
        (post) => `/blog/${post.slug}`
      ),

      ...(FLAGS.WORKSHOP ? ["/workshop"] : []),
    ];
  },
} satisfies Config;
