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

  const titleFontSizeMobile = `${4 * (article.titleMobileSizeRatio ?? 1)}rem`;

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

      <h1
        className={`text-[1.8rem] sm:text-[2rem] tracking-wide font-light mb-1`}
      >
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
        <div className="flex gap-6 mb-14">
          <TimelineDateSquare
            style={{ viewTransitionName: `blog-article-date-${slug}` }}
            className="mt-[0.59rem]"
            date={{
              year: date.getUTCFullYear(),
              month: date.getUTCMonth(),
              day: date.getUTCDate(),
            }}
          />
          <h1 className="text-(size:--titleFontSizeMobile) leading-(--titleFontSizeMobile) sm:text-[4rem] sm:leading-[4rem] lg:text-[5rem] lg:leading-[4.7rem] md:text-[4rem] md:leading-[3.9rem] tracking-wide font-bold mt-[3px]">
            <span
              style={{ viewTransitionName: `blog-article-title-${slug}` }}
              className="[view-transition-class:article-title]"
            >
              {article.title}
            </span>
          </h1>
        </div>

        <div className="space-y-6 text-[16px] leading-[22px]">
          {/**
           * Auto‑slug + id for level-1 headings so they can be linked via #fragment.
           * Keeps track of used ids to ensure uniqueness when duplicate titles appear.
           */}
          <Article
            components={(() => {
              const usedIds = new Set<string>();
              const slugify = (text: string) =>
                text
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+/g, "-");
              const extractText = (node: any): string => {
                if (node == null) return "";
                if (typeof node === "string" || typeof node === "number")
                  return String(node);
                if (Array.isArray(node)) return node.map(extractText).join("");
                if (node.props && node.props.children)
                  return extractText(node.props.children);
                return "";
              };
              const withId = (children: any) => {
                const base = slugify(extractText(children));
                let id = base || "section";
                let i = 2;
                while (usedIds.has(id)) {
                  id = `${base || "section"}-${i++}`;
                }
                usedIds.add(id);
                return id;
              };
              return {
                h1: ({ children }: { children: any }) => {
                  const id = withId(children);
                  return (
                    <h1
                      id={id}
                      className="group scroll-mt-36 relative text-[36px] sm:text-[40px] leading-[38px] mt-[180px] font-bold font-sans"
                    >
                      <a
                        href={`#${id}`}
                        className="absolute -left-8 top-0 opacity-0 group-hover:opacity-70 transition focus:opacity-100"
                        aria-label="Permalink"
                      >
                        #
                      </a>
                      {children}
                    </h1>
                  );
                },
                h2: ({ children }: { children: any }) => {
                  const id = withId(children);
                  return (
                    <h2
                      id={id}
                      className="group scroll-mt-30 relative text-[27px] leading-[28px] mt-[100px] font-bold font-sans"
                    >
                      <a
                        href={`#${id}`}
                        className="absolute -left-7 top-0 opacity-0 group-hover:opacity-70 transition focus:opacity-100"
                        aria-label="Permalink"
                      >
                        #
                      </a>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }: { children: any }) => (
                  <h3 className="text-[24px] leading-[26px] mt-[40px] font-semibold font-sans">
                    {children}
                  </h3>
                ),
                p: ({ children }: { children: any }) => (
                  <p className="text-left sm:text-justify">{children}</p>
                ),
                ul: ({ children }: { children: any }) => (
                  <ul className="list-disc pl-6 space-y-3">{children}</ul>
                ),
                li: ({ children }: { children: any }) => (
                  <li className="text-left">{children}</li>
                ),
                pre: ({ children }: { children: any }) => {
                  const isCodeBlock = (children as any).type === "code";
                  if (isCodeBlock) {
                    return (
                      <pre className="bg-gray-900/85 dark:bg-gray-800/70 rounded-md py-4 px-5 overflow-x-auto font-mono text-[13px]">
                        {children}
                      </pre>
                    );
                  }
                  return <pre>{children}</pre>;
                },
                blockquote: ({ children }: { children: any }) => (
                  <blockquote className="border-l-4 py-4 border-gray-300 dark:border-gray-600 pl-5 italic text-gray-700 dark:text-gray-300">
                    {children}
                  </blockquote>
                ),
              };
            })()}
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
