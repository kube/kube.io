import { Link } from "react-router";
import { H1 } from "../../components/Typography";

import { TimelineDateSquare } from "../../components/DateSquare";
import { type Post, getAllPosts } from "../../data/blog";

const PostItem: React.FC<{ post: Post }> = ({ post }) => {
  const date = new Date(post.date);

  return (
    <Link to={`./${post.slug}`}>
      <li className="flex gap-6">
        <TimelineDateSquare
          date={{
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
            day: date.getUTCDate(),
          }}
        />

        <div className="flex flex-col gap-4">
          <h2 className="text-[2rem] leading-[1.7rem] font-semibold">
            {post.title}
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
      <H1>Blog</H1>

      <ol className="flex flex-col gap-12 mt-8">
        {getAllPosts().map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}
      </ol>
    </>
  );
}
