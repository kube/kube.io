export type Post = {
  slug: string;
  title: string;
  titleMobileSizeRatio?: number;
  cardTitleOffsetY?: number;
  date: string;
  description: string;
  content: any;
  published?: boolean;
  image?: string; // OpenGraph image URL
};

let posts: Post[] = [];

export function getAllPosts() {
  if (posts.length) return posts;

  // Resolve posts only when needed and cache them.
  posts = Object.values(
    import.meta.glob("./articles/**/article.mdx", { eager: true })
  )
    .map<Post>((article: any) => ({
      ...article.frontmatter,
      content: article.default,
    }))
    .filter((post) => post.published !== false) // Only published posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPost(slug: string): Post {
  const posts = getAllPosts();
  const post = posts.find((post) => post.slug === slug);
  if (!post) throw new Error("Post not found");
  return post;
}
