import { IoArrowForward } from "react-icons/io5";
import { Link } from "react-router";
import { TimelineDateSquare } from "../../components/DateSquare.tsx";
import { SocialLinks } from "../../components/SocialLinks.tsx";
import { H1, H2 } from "../../components/Typography.tsx";
import { getAllPosts } from "../../data/blog.ts";
import { FLAGS } from "../../flags.ts";

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
                <h2 className="text-[2.2rem] leading-[2.1rem] font-semibold">
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

      {FLAGS.HIRE_ME && (
        <div className="mt-16">
          <h2 className="text-xl uppercase tracking-wider opacity-60">
            Available{" "}
            <span className="inline-block ml-0.5 mb-0.5 w-3 h-3 bg-green-600 dark:bg-green-500 shadow-[0px_0.5px_4px] shadow-green-500/100 rounded-full" />
          </h2>
          <div className="text-xl">
            <a
              href="https://www.linkedin.com/in/cfeijoo/"
              target="_blank"
              className="uppercase group"
            >
              Hire me{" "}
              <IoArrowForward className="inline-block -mt-0.5 group-hover:translate-x-1 group-active:-translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      )}

      <h2 className="text-xl uppercase tracking-wider opacity-60 mt-16">
        Social
      </h2>
      <SocialLinks />
    </>
  );
}
