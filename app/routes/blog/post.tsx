import type * as Route from "./+types/post";

import Giscus from "@giscus/react";

import { Link } from "react-router";
import { TimelineDateSquare } from "../../components/DateSquare";
import { getPost } from "../../data/blog";

export default function BlogIndex({ params }: Route.ComponentProps) {
  const article = getPost(params.slug);

  if (!article) {
    return <div>Article not found</div>;
  }

  const { slug } = article;

  const date = new Date(article.date);

  return (
    <div>
      <h1
        className={`text-[1.5rem] lg:text-[2rem] md:text-[5rem] md:leading-[4.8rem] tracking-wide font-light`}
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
          <h1 className="text-[4rem] leading-[4rem] lg:text-[5rem] lg:leading-[4.7rem] md:text-[4rem] md:leading-[3.9rem] tracking-wide font-bold">
            <span
              style={{ viewTransitionName: `blog-article-title-${slug}` }}
              className="[view-transition-class:article-title]"
            >
              {article.title}
            </span>
          </h1>
        </div>

        <div className="text-xl font-serif space-y-6 text-justify">
          {article.content()}
        </div>

        <div className="mt-48">
          <Giscus
            id="commments"
            repo="kube/kube.io"
            repoId="MDEwOlJlcG9zaXRvcnkzNTg3NDk2MjA"
            category="Blog"
            categoryId="DIC_kwDOFWIVtM4Cq5qX"
            mapping="specific"
            term={"kube.io/blog/post/" + slug}
            theme="dark"
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
