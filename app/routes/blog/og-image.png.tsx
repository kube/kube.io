import { Resvg } from "@resvg/resvg-js";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { LoaderFunctionArgs } from "react-router";
import { createBackground } from "../../components/Logo/createBackground.tsx";
import { cubeStaticPath } from "../../components/Logo/index.tsx";
import { getPost, Post } from "../../data/blog.ts";

// Precompute kube background pattern (same params as root.css.ts)
const kubeBackground = createBackground(110, 6, 0.1, 0.7);

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const HEADER_HEIGHT = 220;
const PADDING_LEFT = 80;
const PADDING_Y = 60;
const LOGO_SIZE = 100;
const PADDING_INTERNAL = 24;

// React component for the OG card SVG with blog post data
const OGCard: React.FC<Post> = ({ title, cardTitleOffsetY }) => {
  return (
    <svg
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f0f23" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>

        {/* Kube cube pattern */}
        <pattern
          id="kubePattern"
          width={kubeBackground.width * 2}
          height={kubeBackground.height * 2}
          patternUnits="userSpaceOnUse"
          viewBox={kubeBackground.viewBox}
        >
          <path d={kubeBackground.pathD} fill="rgba(255,255,255,0.025)" />
        </pattern>

        {/* Text shadow filter */}
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="4"
            dy="4"
            stdDeviation="8"
            floodColor="rgba(0,0,0,0.2)"
          />
        </filter>

        {/* Logo gradient */}
        <linearGradient id="logoGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="20%" stopColor="#514097" />
          <stop offset="80%" stopColor="#7160b7" />
        </linearGradient>
      </defs>

      {/* Background with gradient */}
      <rect width="100%" height="100%" fill="url(#bgGradient)" />

      <rect
        width="100%"
        height={HEADER_HEIGHT + PADDING_Y}
        fill="#000000"
        opacity={0.25}
      />

      <line
        x1="0"
        y1={HEADER_HEIGHT + PADDING_Y}
        x2={CARD_WIDTH}
        y2={HEADER_HEIGHT + PADDING_Y}
        stroke="#ffffff"
        opacity={0.07}
        strokeWidth="2"
      />

      {/* Subtle kube pattern overlay */}
      <rect
        width="100%"
        height="100%"
        fill="url(#kubePattern)"
        opacity="0.85"
      />

      {/* Logo on the top left */}
      <g
        transform={`translate(${PADDING_LEFT}, ${
          HEADER_HEIGHT / 2 + PADDING_Y
        }) scale(1.58) translate(0, -${LOGO_SIZE / 2})`}
      >
        <svg viewBox="-50 -50 100 100" width="100" height="100">
          <defs>
            <filter
              id="logoShadow"
              x="-200%"
              y="-200%"
              width="400%"
              height="400%"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="5"
                floodColor="black"
                floodOpacity="0.13"
              />
            </filter>
          </defs>
          <path
            transform="translate(-0, -0)"
            filter="url(#logoShadow)"
            d={cubeStaticPath}
            fill="url(#logoGradient)"
          />
        </svg>
      </g>

      {/* Blog post title beneath the logo */}
      <text
        x={PADDING_LEFT}
        y={
          HEADER_HEIGHT +
          (CARD_HEIGHT - HEADER_HEIGHT) / 2 +
          (cardTitleOffsetY ?? 0) -
          PADDING_Y +
          PADDING_INTERNAL
        }
        textAnchor="left"
        fontSize={title.length > 30 ? 72 : 97}
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fill="#ffffff"
        filter="url(#textShadow)"
      >
        {/* Split title into multiple lines if needed */}
        {title.length > 30 ? (
          <>
            <tspan x="80" dy="0">
              {title.slice(0, Math.floor(title.length / 2)).trim()}
            </tspan>
            <tspan x="80" dy="1.2em">
              {title.slice(Math.floor(title.length / 2)).trim()}
            </tspan>
          </>
        ) : (
          <tspan x="80" dy="0">
            {title}
          </tspan>
        )}
      </text>
    </svg>
  );
};

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    // Get the blog post slug from the URL params
    const { slug } = params;

    if (!slug) {
      throw new Error("No slug provided");
    }

    // Load the blog post
    const post = getPost(slug);

    // Render the React SVG component to string with blog post title
    const svgString = renderToStaticMarkup(<OGCard {...post} />);

    // Convert SVG to PNG using ReSVG
    const resvg = new Resvg(svgString, {
      background: "rgba(255, 255, 255, 0)", // Transparent background
      fitTo: {
        mode: "width",
        value: 1200,
      },
    });

    // Render to PNG buffer
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Content-Length": pngBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating blog post OG image:", error);

    // Return a simple error response
    return new Response("Image generation failed", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
