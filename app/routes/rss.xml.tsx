import type { LoaderFunctionArgs } from "react-router";
import { escapeXml, getFeedData } from "../data/feeds";

export async function loader(_: LoaderFunctionArgs) {
  const { posts, config } = getFeedData();

  const items = posts
    .map((post) => {
      const link = `${config.origin}/blog/${post.slug}`;
      const title = escapeXml(post.title);
      const description = post.description ? escapeXml(post.description) : "";
      const pubDate = new Date(post.date).toUTCString();
      return `
  <item>
    <title>${title}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${description}</description>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${config.origin}</link>
    <description>${escapeXml(config.description)}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
