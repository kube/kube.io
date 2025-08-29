import { Link } from "react-router";
import { TimelineDateSquare } from "../../components/DateSquare.tsx";
import { SocialLinks } from "../../components/SocialLinks.tsx";
import { H1, H2 } from "../../components/Typography.tsx";
import { getAllPosts } from "../../data/blog.ts";

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 2);
  return (
    <>
      <H1 id="hello">Hello.</H1>
      <H2>I build Software & Design.</H2>

      <h2 className="text-xl uppercase tracking-wider opacity-60 mt-12">
        Latest articles
      </h2>

      <ol className="flex flex-col gap-12 mt-2">
        {latestPosts.map((post) => {
          const date = new Date(post.date);
          const slug = post.slug;
          return (
            <li key={slug} className="flex gap-6">
              <TimelineDateSquare
                date={{
                  year: date.getUTCFullYear(),
                  month: date.getUTCMonth(),
                  day: date.getUTCDate(),
                }}
              />

              <div className="flex flex-col gap-4">
                <h2 className="text-[2.2rem] leading-[2.2rem] font-semibold">
                  <Link to={`/blog/${slug}`} viewTransition>
                    {post.title}
                  </Link>
                </h2>
                {post.description}
              </div>
            </li>
          );
        })}
      </ol>

      <h2 className="text-xl uppercase tracking-wider opacity-60 mt-12">
        Social
      </h2>

      <SocialLinks />
    </>
  );
}
