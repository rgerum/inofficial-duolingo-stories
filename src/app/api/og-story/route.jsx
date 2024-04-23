import { ImageResponse } from "next/og";
import React, { cache } from "react";

//import { sql } from "../../../lib/db";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

const get_counts = cache(async () => {
  return (
    await sql`SELECT COUNT(DISTINCT c.id) AS count_courses, COUNT(DISTINCT s.id) as count_stories FROM course c
LEFT JOIN story s ON (c.id = s.course_id)
WHERE s.public AND NOT s.deleted AND c.public`
  )[0];
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const fontData = await fetch(
      new URL("../../../../assets/Nunito-Regular.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

    // ?title=<title>
    const hasTitle = searchParams.has("title");
    const title = hasTitle
      ? searchParams.get("title")?.slice(0, 100)
      : "My default title";

    //let counts = get_counts();
    let counts = { count_stories: 0, count_courses: 0 };

    let text = `A community project to bring the original Duolingo Stories to new languages.`;
    let text2 = `${counts.count_stories} stories in ${counts.count_courses} courses and counting!`;

    const imageData = await fetch(
      new URL("./og_background.png", import.meta.url),
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: "70%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "30px",
          }}
        >
          <img
            style={{
              position: "absolute",
              left: 0,
              top: 0,
            }}
            height="630px"
            width="1200px"
            src={imageData}
          />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              justifyItems: "left",
              flexDirection: "column",
              fontSize: 40,
              width: "60%",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 80 }}>
              {searchParams.get("title", "Good morning")}
            </div>
            <div style={{ textAlign: "left" }}>
              {`${searchParams.get(
                "name",
                "Language",
              )} story on duostories.org`}
            </div>
          </div>
          <img
            src={`https://stories-cdn.duolingo.com/image/${searchParams.get(
              "image",
              "783305780a6dad8e0e4eb34109d948e6a5fc2c35",
            )}.svg`}
            height={290}
            width={300}
          ></img>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Nunito",
            data: fontData,
            style: "normal",
          },
        ],
      },
    );
    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: "white",
            backgroundSize: "150px 150px",
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            flexWrap: "nowrap",
          }}
        >
          <img
            height={"30px"}
            width="300px"
            src="https://duostories.org/Duostories.svg"
          ></img>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              justifyItems: "center",
            }}
          >
            <div
              style={{
                width: 82,
                height: 66,
                backgroundSizeX: "cover",
                backgroundPosition: `0px -${66 * 8}px`,
                backgroundColor: "white",
                backgroundSize: " 82px 3168px",
                backgroundImage:
                  "url(https://d35aaqx5ub95lt.cloudfront.net/vendor/87938207afff1598611ba626a8c4827c.svg)",
              }}
            ></div>
            <span>Duostories</span>
            <img
              height="62"
              src="https://carex.uber.space/stories/flags/flag_yue.svg"
              width="78"
            ></img>
          </div>
          <div
            style={{
              fontSize: 60,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              color: "black",
              marginTop: 30,
              padding: "0 120px",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {text}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
