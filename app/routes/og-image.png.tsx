import { Resvg } from "@resvg/resvg-js";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { LoaderFunctionArgs } from "react-router";
import { cubeStaticPath } from "../components/Logo/index.tsx";

// React component for the OG card SVG
const OGCard: React.FC = () => {
  const width = 1200;
  const height = 630;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f0f23" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>

        {/* Grid pattern */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        </pattern>

        {/* Text shadow filter */}
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="4"
            dy="4"
            stdDeviation="8"
            floodColor="rgba(0,0,0,0.3)"
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

      {/* Subtle grid pattern */}
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Logo centered */}
      <g
        transform={`translate(${width / 2}, ${
          height / 2
        }) scale(3) translate(-50, -50)`}
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
    </svg>
  );
};

export async function loader(_: LoaderFunctionArgs) {
  try {
    // Render the React SVG component to string
    const svgString = renderToStaticMarkup(<OGCard />);

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
    console.error("Error generating OG image:", error);

    // Return a simple error response
    return new Response("Image generation failed", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
