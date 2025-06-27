import React from "react";
import { cn } from "../utils";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export type TimelineDate =
  | { year: number; month?: number; day?: undefined }
  | { year: number; month: number; day: number };

export type TimelineDateSquareProps = {
  className?: string;
  date: TimelineDate | { from: TimelineDate; to?: TimelineDate };
};

const DateSingle: React.FC<{ date: TimelineDate; showYear?: boolean }> = ({
  date,
  showYear = true,
}) => (
  <div className="flex flex-col text-lg tabular-nums space-y-1 text-gray-500">
    {showYear && <div className="text-[1.125rem] leading-4.5">{date.year}</div>}

    {date.month && (
      <div className="text-[1.25rem] flex justify-between leading-5">
        {MONTHS[date.month - 1].split("").map((letter, i) => (
          <span key={i}>{letter}</span>
        ))}
      </div>
    )}

    {date.day && (
      <div className="flex justify-between text-[2.2rem] tabular-nums leading-[2.2rem]">
        {[date.day < 10 ? "0" : null, ...date.day.toString().split("")].map(
          (digit, i) => (
            <span key={i}>{digit}</span>
          )
        )}
      </div>
    )}
  </div>
);

const DateRange: React.FC<{ from: TimelineDate; to?: TimelineDate }> = ({
  from,
  to,
}) => (
  <>
    {!to && (
      <div className="leading-4 uppercase text-sm flex justify-between mb-1.5">
        {"Since".split("").map((letter, i) => (
          <span key={i}>{letter}</span>
        ))}
      </div>
    )}

    <DateSingle date={from} />

    {to && (
      <>
        <div className="text-center leading-4">—</div>
        <DateSingle date={to} showYear={to.year !== from.year} />
      </>
    )}
  </>
);

export const TimelineDateSquare: React.FC<TimelineDateSquareProps> = ({
  className,
  date,
}) => (
  <div className={cn("text-lg tabular-nums text-gray-500", className)}>
    {"from" in date ? (
      <DateRange from={date.from} to={date.to} />
    ) : (
      <DateSingle date={date} />
    )}
  </div>
);
