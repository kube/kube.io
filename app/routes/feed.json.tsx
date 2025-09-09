import type { LoaderFunctionArgs } from "react-router";
import { getFeedData } from "../data/feeds";

export async function loader(_: LoaderFunctionArgs) {
  const { posts, config } = getFeedData();

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: config.title,
    home_page_url: config.origin,
    feed_url: `${config.origin}/feed.json`,
    description: config.description,
    author: {
      name: config.author.name,
      url: config.author.url,
    },
    items: posts.map((post) => ({
      id: `${config.origin}/blog/${post.slug}`,
      url: `${config.origin}/blog/${post.slug}`,
      title: post.title,
      content_text: post.description || "",
      date_published: new Date(post.date).toISOString(),
      date_modified: new Date(post.date).toISOString(), // Assuming publish date = modified date
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
