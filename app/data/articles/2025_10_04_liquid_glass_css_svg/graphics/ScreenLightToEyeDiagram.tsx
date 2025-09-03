export function ScreenLightToEyeDiagram() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 select-none">
      <svg viewBox="0 0 555 180" className="w-full h-auto bg-transparent">
        {/* Viewer (eye) - profile view */}
        <g transform="translate(80, 80)">
          {/* Eye shape - almond/oval from profile */}
          <ellipse
            cx="0"
            cy="0"
            rx="18"
            ry="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Iris */}
          <circle cx="7" cy="0" r="6" fill="currentColor" opacity="0.8" />
          {/* Small highlight */}
          <circle
            cx="4"
            cy="-2"
            r="1"
            className="white dark:black"
            opacity="0.9"
          />
          <text
            x="0"
            y="35"
            textAnchor="middle"
            className="text-sm font-medium fill-current"
          >
            viewer
          </text>
        </g>

        {/* Light ray arrow */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="7"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 7 3, 0 6" fill="currentColor" />
          </marker>
        </defs>

        {/* Light ray line */}
        <line
          x1="105"
          y1="80"
          x2="470"
          y2="80"
          stroke="currentColor"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />

        {/* Light ray label */}
        <text
          x="270"
          y="70"
          textAnchor="middle"
          className="text-sm font-medium fill-current"
        >
          light ray
        </text>

        {/* Screen */}
        <g transform="translate(480, 20)">
          <rect
            x="0"
            y="0"
            width="15"
            height="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="4"
            y="5"
            width="7"
            height="110"
            fill="currentColor"
            opacity="0.1"
          />
          <text
            x="7"
            y="140"
            textAnchor="middle"
            className="text-sm font-medium fill-current"
          >
            screen
          </text>
        </g>
      </svg>
    </div>
  );
}
