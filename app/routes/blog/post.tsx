import type * as Route from "./+types.post";

import { H1 } from "../../components/Typography";

import { TimelineDateSquare } from "../../components/DateSquare";
import { getPost } from "../../data/blog";

export default function BlogIndex({ params }: Route.ComponentProps) {
  const article = getPost(params.slug);

  if (!article) {
    return <div>Article not found</div>;
  }

  const date = new Date(article.date);

  return (
    <>
      <div className="flex gap-8 mb-14">
        <TimelineDateSquare
          className="mt-[0.59rem]"
          date={{
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
            day: date.getUTCDate(),
          }}
        />
        <H1>{article.title}</H1>
      </div>

      <div className="text-xl font-serif space-y-6 text-justify">
        {article.content()}
      </div>
    </>
  );
}
