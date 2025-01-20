import { TimelineDate, TimelineDateSquare } from "../../components/DateSquare";

type TimelineItem = {
  date: TimelineDate | { from: TimelineDate; to?: TimelineDate };
  title: string;
  place?: string;
  subtitle: string;
  url?: string;
  description?: string[];
  stack?: string[];
};

type TimelineProps = {
  timeline: TimelineItem[];
};

export const Timeline: React.FC<TimelineProps> = ({ timeline }) => {
  return (
    <ul className="flex flex-col gap-16 mt-4">
      {timeline.map((line, index) => (
        <li key={index} className="flex gap-8">
          <TimelineDateSquare date={line.date} />

          <div className="space-y-4">
            <div className="space-x-4 align-text-bottom leading-[1.5rem] text-[1.5rem]">
              <a
                href={line.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold whitespace-break-spaces"
              >
                {line.title}
              </a>

              {line.place && (
                <span className="text-gray-500">{line.place}</span>
              )}
            </div>

            <div className="text-[1.5rem] leading-[1.5rem]">
              {line.subtitle}
            </div>

            {line.description && (
              <div className="text-[1.05rem] space-y-2 leading-[1.4rem]">
                {line.description.map((descriptionLine, index) => (
                  <p key={index}>{descriptionLine}</p>
                ))}
              </div>
            )}

            {line.stack && (
              <ul className="flex gap-2 flex-wrap">
                {line.stack.map((item, index) => (
                  <li
                    key={index}
                    className="border-gray-400 text-gray-400 border rounded text-[0.7rem] uppercase px-[3px] py-[1px] whitespace-nowrap"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
