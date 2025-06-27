import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToStream,
} from "@react-pdf/renderer";

import {
  TimelineDate,
  type TimelineDateSquareProps,
} from "../../components/DateSquare";
import { type TimelineProps } from "./Timeline";

import { cv } from "../../data/cv";

Font.register({
  family: "Inter",
  fonts: [
    {
      fontWeight: 100,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 200,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 300,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 400,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 500,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 600,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 700,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 800,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 900,
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    fontFamily: "Inter",
    paddingHorizontal: 60,
    paddingVertical: 50,
    gap: 40,
    flexShrink: 0,
  },
});

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

const DateSingle: React.FC<{ date: TimelineDate; showYear?: boolean }> = ({
  date,
  showYear = true,
}) => (
  <View
    style={{
      flexDirection: "column",
      textAlign: "center",
      fontSize: 10,
      color: "#4A5568",
      width: 27,
    }}
  >
    {showYear && (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {date.year
          .toString()
          .split("")
          .map((letter, index) => (
            <Text key={index}>{letter}</Text>
          ))}
      </View>
    )}

    {date.month && (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {MONTHS[date.month - 1].split("").map((letter, i) => (
          <Text key={i}>{letter}</Text>
        ))}
      </View>
    )}

    {date.day && (
      <Text
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {[date.day < 10 ? "0" : null, ...date.day.toString().split("")].map(
          (digit, i) => (
            <span key={i}>{digit}</span>
          )
        )}
      </Text>
    )}
  </View>
);

const DateRange: React.FC<{ from: TimelineDate; to?: TimelineDate }> = ({
  from,
  to,
}) => (
  <>
    {!to && (
      <View
        style={{
          textTransform: "uppercase",
          fontSize: 7.5,
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 1,
          marginBottom: 2,
        }}
      >
        {"Since".split("").map((letter, index) => (
          <Text key={index}>{letter}</Text>
        ))}
      </View>
    )}

    <DateSingle date={from} />

    {to && (
      <>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: 300,
              lineHeight: 0.9,
              marginTop: -4,
            }}
          >
            —
          </Text>
        </View>
        <DateSingle date={to} showYear={to.year !== from.year} />
      </>
    )}
  </>
);

export const TimelineDateSquare: React.FC<TimelineDateSquareProps> = ({
  date,
}) => (
  <View style={{ flexDirection: "column", textAlign: "center" }}>
    {"from" in date ? (
      <DateRange from={date.from} to={date.to} />
    ) : (
      <DateSingle date={date} />
    )}
  </View>
);

const Timeline: React.FC<TimelineProps> = ({ timeline }) => {
  return (
    <View style={{ gap: 20, flexShrink: 0 }}>
      {timeline.map((line, index) => (
        <View
          key={index}
          wrap={false}
          style={{ flexDirection: "row", gap: 14 }}
        >
          <View style={{ flexGrow: 0, flexShrink: 0 }}>
            <TimelineDateSquare date={line.date} />
          </View>

          <View style={{ marginTop: -2, flexShrink: 0 }}>
            <View style={{ flexDirection: "row", gap: 6, fontSize: 13 }}>
              <Text style={{ fontWeight: 600 }}>{line.title}</Text>
              {line.place && <Text>{line.place}</Text>}
            </View>
            <Text style={{ fontSize: 13, lineHeight: 1.2, marginTop: 2 }}>
              {line.subtitle}
            </Text>
            {line.description && (
              <View
                style={{
                  fontSize: 9,
                  marginTop: 5,
                  marginBottom: 6,
                  maxWidth: 436,
                }}
              >
                {line.description.map((desc, descIndex) => (
                  <Text
                    key={descIndex}
                    style={{
                      lineHeight: 0.6,
                      textAlign: "justify",
                      marginVertical: 2,
                    }}
                  >
                    {desc}
                  </Text>
                ))}
              </View>
            )}
            {line.stack && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {line.stack.map((item, itemIndex) => (
                  <Text
                    key={itemIndex}
                    style={{
                      textTransform: "uppercase",
                      fontSize: 6.5,
                      borderWidth: 0.8,
                      borderRadius: 2,
                      paddingLeft: 3,
                      paddingRight: 1,
                      paddingTop: 1.5,
                    }}
                  >
                    {item}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

// Create Document Component
const CV = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={{ fontSize: 12 }}>
        <Text style={{ fontWeight: 600, fontSize: 22, marginLeft: -1 }}>
          {cv.firstName} {cv.lastName}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: 500 }}>{cv.job}</Text>
        <Text style={{ marginBottom: 5 }}>
          {cv.address.city}, {cv.address.country}
        </Text>
        <Text>{cv.website}</Text>
        <Text>
          {cv.mail.user}@{cv.mail.domain}
        </Text>
        <Text>{cv.phone.replace(/[0-9][0-9]/g, (_) => _ + " ")}</Text>
      </View>

      <View id="cursus" style={{ gap: 20 }}>
        <Text
          style={{
            textTransform: "uppercase",
            fontWeight: 200,
            fontSize: 16,
            letterSpacing: 1,
            marginLeft: -1,
          }}
        >
          Cursus
        </Text>
        <Timeline timeline={cv.cursus} />
      </View>

      <View id="experience" style={{ gap: 20 }}>
        <Text
          style={{
            textTransform: "uppercase",
            fontWeight: 200,
            fontSize: 16,
            letterSpacing: 1,
            marginLeft: -1,
          }}
        >
          Experience
        </Text>
        <Timeline timeline={cv.work} />
      </View>
    </Page>
  </Document>
);

export async function loader() {
  const pdf = await renderToStream(<CV />);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-cache",
      // "Content-Disposition": "attachment; filename=cv.pdf",
    },
  });
}
