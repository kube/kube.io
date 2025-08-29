import type { LoaderFunctionArgs } from "react-router";
import { getAllPosts } from "../data/blog";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const posts = getAllPosts();
  const { origin } = new URL(request.url);

  const channelTitle = "kube.io";
  const channelLink = origin;
  const channelDescription = "Articles and notes";

  const items = posts
    .map((post) => {
      const link = `${origin}/blog/${post.slug}`;
      const title = escapeXml(post.title);
      const description = post.description
        ? escapeXml(post.description)
        : "";
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
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(channelDescription)}</description>
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
