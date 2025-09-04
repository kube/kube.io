export interface MetaConfig {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: "website" | "article" | "profile";
  publishDate?: string;
  modifiedDate?: string;
}

export const DEFAULT_META = {
  siteName: "kube.io",
  author: "kube",
  twitterHandle: "@KubeKhrm",
  locale: "en_US",
  defaultImage: "https://kube.io/og-image.png",
};

export function createMetaTags(config: MetaConfig) {
  const {
    title,
    description,
    url,
    image = DEFAULT_META.defaultImage,
    type = "website",
    publishDate,
    modifiedDate,
  } = config;

  const tags = [
    { title },
    { name: "description", content: description },
    
    // Canonical URL
    { tagName: "link", rel: "canonical", href: url },
    
    // OpenGraph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: DEFAULT_META.siteName },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: title },
    { property: "og:locale", content: DEFAULT_META.locale },
    
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: DEFAULT_META.twitterHandle },
    { name: "twitter:creator", content: DEFAULT_META.twitterHandle },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: title },
    
    // Additional meta
    { name: "author", content: DEFAULT_META.author },
    { name: "robots", content: "index, follow" },
    { name: "language", content: "en" },
  ];

  // Add article-specific meta
  if (type === "article" && publishDate) {
    tags.push(
      { property: "article:published_time", content: publishDate },
      { property: "article:author", content: `https://${DEFAULT_META.siteName}` },
      { property: "article:section", content: "Technology" },
      { property: "article:tag", content: "Web Development" }
    );
    
    if (modifiedDate) {
      tags.push({ property: "article:modified_time", content: modifiedDate });
    }
  }

  return tags;
}

export function createBlogPostMeta(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image?: string;
}) {
  const url = `https://${DEFAULT_META.siteName}/blog/${post.slug}`;
  const publishDate = new Date(post.date).toISOString();
  const title = `${post.title} — ${DEFAULT_META.siteName}`;
  
  return createMetaTags({
    title,
    description: post.description,
    url,
    image: post.image,
    type: "article",
    publishDate,
    modifiedDate: publishDate,
  });
}

export function createStructuredData(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image || DEFAULT_META.defaultImage,
    author: {
      "@type": "Person",
      name: DEFAULT_META.author,
      url: `https://${DEFAULT_META.siteName}`,
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_META.siteName,
      logo: {
        "@type": "ImageObject",
        url: `https://${DEFAULT_META.siteName}/logo.png`,
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://${DEFAULT_META.siteName}/blog/${post.slug}`,
    },
  };
}
