import { type Route } from "./+types/post";

import Giscus from "@giscus/react";

import type { MDXProvider } from "@mdx-js/react";
import { Link } from "react-router";
import { TimelineDateSquare } from "../../components/DateSquare";
import { getPost } from "../../data/blog";
import { createBlogPostMeta, createStructuredData } from "../../utils/meta";

export const meta: Route.MetaFunction = ({ params }) => {
  try {
    const article = getPost(params.slug);
    return createBlogPostMeta(article);
  } catch (error) {
    // Fallback if article not found
    return [
      { title: "Article not found — kube.io" },
      {
        name: "description",
        content: "The requested article could not be found.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
};

export default function BlogIndex({ params }: Route.ComponentProps) {
  const article = getPost(params.slug);

  if (!article) {
    return <div>Article not found</div>;
  }

  const { slug } = article;

  const date = new Date(article.date);

  const Article: typeof MDXProvider = article.content;

  // Calculate title size for mobile
  const titleLongestWord = article.title
    .split(/[\s-]/g)
    .reduce(
      (longest, word) => (word.length > longest.length ? word : longest),
      ""
    );
  const titleFontSizeMobile =
    titleLongestWord.length > 10
      ? `${40 / titleLongestWord.length}rem`
      : "4rem";

  // Structured data for the article
  const structuredData = createStructuredData(article);

  return (
    <div
      style={
        {
          "--titleFontSizeMobile": titleFontSizeMobile,
        } as React.CSSProperties
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
        integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+"
        crossOrigin="anonymous"
      />

      <h1 className={`text-[1.8rem] sm:text-[2rem] tracking-wide font-light`}>
        <Link to="/blog" viewTransition>
          <span
            style={{ viewTransitionName: "hero-title-blog" }}
            className="[view-transition-class:herotitle]"
          >
            Articles /
          </span>
        </Link>
      </h1>

      <div style={{ viewTransitionName: `blog-article-container-${slug}` }}>
        <div className="flex gap-8 mb-14">
          <TimelineDateSquare
            style={{ viewTransitionName: `blog-article-date-${slug}` }}
            className="mt-[0.59rem]"
            date={{
              year: date.getUTCFullYear(),
              month: date.getUTCMonth(),
              day: date.getUTCDate(),
            }}
          />
          <h1 className="text-(size:--titleFontSizeMobile) leading-(--titleFontSizeMobile) sm:text-[4rem] sm:leading-[4rem] lg:text-[5rem] lg:leading-[4.7rem] md:text-[4rem] md:leading-[3.9rem] tracking-wide font-bold">
            <span
              style={{ viewTransitionName: `blog-article-title-${slug}` }}
              className="[view-transition-class:article-title]"
            >
              {article.title}
            </span>
          </h1>
        </div>

        <div className="space-y-6 text-[16px] leading-[22px]">
          <Article
            components={{
              h1: ({ children }) => (
                <h1 className="text-[36px] sm:text-[40px] leading-[38px] mt-[180px] font-bold font-sans">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-[27px] leading-[28px] mt-[100px] font-bold font-sans">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-[24px] leading-[26px] mt-[40px] font-semibold font-sans">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="text-justify">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc pl-6 space-y-2">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="text-justify">{children}</li>
              ),
              pre: ({ children }) => {
                const isCodeBlock = children.type === "code";

                if (isCodeBlock) {
                  return (
                    <pre className="bg-gray-800/90 dark:bg-gray-800/50 rounded-md p-4 overflow-x-auto font-mono text-[13px]">
                      {children}
                    </pre>
                  );
                }

                return <pre>{children}</pre>;
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 py-4 border-gray-300 dark:border-gray-600 pl-5 italic text-gray-700 dark:text-gray-300">
                  {children}
                </blockquote>
              ),
            }}
          />
        </div>

        <div className="mt-48">
          <Giscus
            id="commments"
            repo="kube/kube.io"
            repoId="MDEwOlJlcG9zaXRvcnkzNTg3NDk2MjA"
            category="Blog"
            categoryId="DIC_kwDOFWIVtM4Cq5qX"
            mapping="specific"
            term={article.title}
            theme="preferred_color_scheme"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            lang="en"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
