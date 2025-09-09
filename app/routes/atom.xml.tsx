import type { LoaderFunctionArgs } from "react-router";
import { escapeXml, getFeedData } from "../data/feeds";

export async function loader(_: LoaderFunctionArgs) {
  const { posts, config } = getFeedData();

  const entries = posts
    .map((post) => {
      const link = `${config.origin}/blog/${post.slug}`;
      const title = escapeXml(post.title);
      const description = post.description ? escapeXml(post.description) : "";
      const published = new Date(post.date).toISOString();
      const updated = new Date(post.date).toISOString(); // Assuming publish date = update date

      return `  <entry>
    <title>${title}</title>
    <link href="${link}" />
    <id>${link}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <author>
      <name>${escapeXml(config.author.name)}</name>
      <email>${escapeXml(config.author.email)}</email>
    </author>
    <summary type="text">${description}</summary>
    <content type="html">${description}</content>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.title)}</title>
  <link href="${config.origin}" />
  <link href="${config.origin}/atom.xml" rel="self" />
  <id>${config.origin}</id>
  <updated>${new Date().toISOString()}</updated>
  <subtitle>${escapeXml(config.description)}</subtitle>
  <author>
    <name>${escapeXml(config.author.name)}</name>
    <email>${escapeXml(config.author.email)}</email>
  </author>
${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
