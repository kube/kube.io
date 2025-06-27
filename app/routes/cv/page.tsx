import { DownloadIcon } from "lucide-react";
import { Link } from "react-router";

import { cv } from "../../data/cv";

import { H1, H2 } from "../../components/Typography";
import { Timeline } from "./Timeline";

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Link id={title} to={`#${title}`}>
    <h3 className="tracking-widest mb-12 text-[1.9rem] leading-[1.9rem] font-extralight uppercase">
      {title}
    </h3>
  </Link>
);

export default function CVPage() {
  return (
    <div className="space-y-24">
      <H1>
        Curiculum Vitae{" "}
        <Link
          to="/cv.pdf"
          target="_blank"
          className="rounded-full p-2 inline-flex items-center justify-center border-1"
          title="Download CV"
        >
          <DownloadIcon className="w-5 h-5" />
        </Link>
      </H1>

      <section className="text-xl space-y-1">
        <H2>
          {cv.firstName} {cv.lastName}
        </H2>
        <div className="text-3xl">{cv.job}</div>

        <div>
          {cv.address.city}, {cv.address.country}
        </div>

        <div>{cv.website}</div>

        <div>
          <span>{cv.mail.user}</span>
          <span className="before:content-['@']">{cv.mail.domain}</span>
        </div>

        <div>{cv.phone.replace(/[0-9][0-9]/g, (_) => _ + " ")}</div>
      </section>

      {/* <section className="grid grid-cols-3 w-full text-[1.4rem]">
        <div>
          <SectionTitle title="Code" />
          <ul>
            {cv.languages.map((language) => (
              <li key={language}>{language}</li>
            ))}
          </ul>
        </div>

        <div>
          <SectionTitle title="Stack" />
          <ul>
            {cv.frameworks.map((framework) => (
              <li key={framework}>{framework}</li>
            ))}
          </ul>
        </div>

        <div>
          <SectionTitle title="Tools" />
          <ul>
            {cv.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </section> */}

      <section>
        <SectionTitle title="Cursus" />
        <Timeline timeline={cv.cursus} />
      </section>

      <section>
        <SectionTitle title="Experience" />
        <Timeline timeline={cv.work} />
      </section>
    </div>
  );
}
