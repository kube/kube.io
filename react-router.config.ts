import type { Config } from "@react-router/dev/config";

import { FLAGS } from "./app/flags.ts";

import fm from "front-matter";
import fs from "node:fs";

export const POSTS = fs.readdirSync("./app/data/articles").map((file) => {
  const post = fs.readFileSync(`./app/data/articles/${file}`, "utf-8");
  return fm(post).attributes as { slug: string };
});

export default {
  ssr: false,
  async prerender() {
    return [
      "/",
      "/cv",
      ...(FLAGS.BLOG
        ? ["/blog", ...POSTS.map((post) => `/blog/${post.slug}`)]
        : []),
      ...(FLAGS.WORKSHOP ? ["/workshop"] : []),
    ];
  },
} satisfies Config;
