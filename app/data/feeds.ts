import { getAllPosts } from "./blog";

export interface FeedConfig {
  title: string;
  description: string;
  origin: string;
  author: {
    name: string;
    email: string;
    url?: string;
  };
}

export function getFeedData() {
  const posts = getAllPosts();
  const config: FeedConfig = {
    title: "kube.io",
    description: "Articles and notes",
    origin: "https://kube.io",
    author: {
      name: "kube",
      email: "contact@kube.io",
      url: "https://kube.io",
    },
  };

  return { posts, config };
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
