import { Link } from "react-router";
import { H1 } from "../../components/Typography";

import { TimelineDateSquare } from "../../components/DateSquare";
import { type Post, getAllPosts } from "../../data/blog";

const PostItem: React.FC<{ post: Post }> = ({ post }) => {
  const { slug } = post;
  const href = `./${slug}`;

  const date = new Date(post.date);

  return (
    <Link to={href} viewTransition>
      <li
        style={{ viewTransitionName: `blog-article-container-${slug}` }}
        className={"flex gap-6"}
      >
        <TimelineDateSquare
          style={{ viewTransitionName: `blog-article-date-${slug}` }}
          date={{
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
            day: date.getUTCDate(),
          }}
        />

        <div className="flex flex-col gap-4">
          <h2 className="text-[2.7rem] leading-[2.5rem] font-semibold">
            <span style={{ viewTransitionName: `blog-article-title-${slug}` }}>
              {post.title}
            </span>
          </h2>

          {post.description}
        </div>
      </li>
    </Link>
  );
};

export default function BlogIndex() {
  return (
    <>
      <H1 id="blog">Articles</H1>

      <ol className="flex flex-col gap-12 mt-8">
        {getAllPosts().map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}
      </ol>
    </>
  );
}
