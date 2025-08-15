import { useId, useState } from "react";
import { RayRefractionSimulationMini } from "./RayRefractionSimulationMini";
import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
} from "./displacementMap";
import { imageDataToUrl } from "./imageDataToUrl";

type RefractionDetailProps = {
  equationFn: (x: number) => number;
  equationRender: React.ReactNode;
};

export const RefractionDetail: React.FC<RefractionDetailProps> = ({
  equationFn,
  equationRender,
}) => {
  const filterId = useId();

  const width = 400;
  const height = 300;

  const [currentX, setCurrentX] = useState<number>();

  const [glassThickness, setGlassThickness] = useState(50);
  const [bezelWidth, setBezelWidth] = useState(60);
  const refractiveIndex = 1.5;
  const objectWidth = 200;
  const objectHeight = 200;
  const radius = 100;
  const [scaleRatio, setScaleRatio] = useState(1);

  const precomputedDisplacementMap = calculateDisplacementMap(
    glassThickness,
    bezelWidth,
    equationFn,
    refractiveIndex
  );

  const maximumDisplacement = Math.max(
    ...precomputedDisplacementMap.map(Math.abs)
  );

  const imageData = calculateDisplacementMap2(
    width,
    height,
    objectWidth,
    objectHeight,
    radius,
    bezelWidth,
    maximumDisplacement,
    precomputedDisplacementMap
  );

  const displacementMapUrl = imageDataToUrl(imageData);

  const pathData = precomputedDisplacementMap
    .map((d, i) => {
      const x = (i / precomputedDisplacementMap.length) * width;
      return `${i === 0 ? "M" : "L"} ${x} ${
        height / 2 - ((d / maximumDisplacement) * height) / 2
      }`;
    })
    .join(" ");

  return (
    <div className="grid grid-cols-2 gap-1 text-black *:rounded *:bg-white *:overflow-hidden *:relative select-none -ml-[15px] w-[calc(100%+30px)]">
      <div className="flex flex-col">
        <h4 className="text-xs uppercase opacity-60 px-1.5 pt-1 z-40 grow-0">
          Bezel Height Function
        </h4>
        <div className="text-xl p-5 flex items-center grow">
          {typeof equationRender === "string" &&
          equationRender.trim().startsWith("<") ? (
            <span dangerouslySetInnerHTML={{ __html: equationRender }} />
          ) : (
            equationRender
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase opacity-60 px-1.5 pt-1 z-40">
          Controls
        </h4>
        <div className="text-xs grid grid-cols-[25%_1fr] gap-2 p-2">
          <label>Bezel Width</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={bezelWidth}
            onChange={(e) => setBezelWidth(Number(e.target.value))}
            className="w-full"
          />
          <label>Glass Thickness</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={glassThickness}
            onChange={(e) => setGlassThickness(Number(e.target.value))}
            className="w-full"
          />
          <label>Scale Ratio</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scaleRatio}
            onChange={(e) => setScaleRatio(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      <div className="rounded bg-white">
        <h4 className="text-xs uppercase opacity-60 absolute px-1.5 pt-1 z-40">
          Ray Simulation
        </h4>
        <div className="text-sm">
          <RayRefractionSimulationMini
            bezelHeightFn={equationFn}
            bezelWidth={bezelWidth}
            glassThickness={glassThickness}
            refractionIndex={refractiveIndex}
            currentX={currentX}
            onCurrentXChange={setCurrentX}
          />
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase opacity-60 absolute px-1.5 pt-1 z-40">
          Displacement Map
        </h4>
        <div
          className="text-sm select-none"
          aria-label="Displacement Map"
          style={{
            width: "100%",
            aspectRatio: "4 / 3",
            backgroundImage: `url(${displacementMapUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      <div>
        <h4 className="text-xs uppercase opacity-60 absolute px-1.5 pt-1 z-40">
          Pre-calculated Displacements
        </h4>
        <div className="text-sm">
          <svg
            viewBox="-30 -30 460 360"
            width="100%"
            onClick={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              const xRatio = (e.clientX - left) / width;
              const newRayOriginX = xRatio * width;
              setCurrentX(newRayOriginX / width);
            }}
          >
            <defs>
              <marker
                id="axisArrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
              </marker>
            </defs>
            <path
              d={pathData}
              fill="none"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              y1={height / 2}
              y2={height / 2}
              x1={0}
              x2={width}
              stroke="black"
              strokeWidth="1"
            />
            <line
              x1={-1}
              x2={-1}
              y1={height}
              y2={0}
              stroke="black"
              strokeWidth="1"
              markerEnd="url(#axisArrow)"
            />
            <text
              x={0}
              y={-12}
              alignmentBaseline="middle"
              textAnchor="end"
              transform="rotate(-90 0 0)"
            >
              Ray displacement on background
            </text>
            <line
              x1={0}
              x2={width}
              y1={height}
              y2={height}
              stroke="black"
              strokeWidth="1"
              markerEnd="url(#axisArrow)"
            />
            <text
              x={width}
              y={height + 12}
              alignmentBaseline="middle"
              textAnchor="end"
            >
              Distance to border
            </text>
            {currentX !== undefined && (
              <line
                x1={currentX * width}
                y1={height / 2}
                x2={currentX * width}
                y2={
                  height / 2 -
                  precomputedDisplacementMap[
                    (currentX * precomputedDisplacementMap.length) | 0
                  ] *
                    (height / maximumDisplacement / 2)
                }
                stroke="red"
                strokeWidth="2"
                strokeDasharray="4"
              />
            )}
          </svg>
        </div>
      </div>

      <div>
        <h4 className="text-sm uppercase opacity-60 absolute px-1.5 pt-1 z-40">
          Preview
        </h4>
        <div className="text-sm">
          <svg
            className="object-cover"
            viewBox="0 0 400 300"
            width="100%"
            color-interpolation-filters="sRGB"
          >
            <defs>
              <filter id={filterId}>
                <feImage
                  href={displacementMapUrl}
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  result="displacement_map"
                />

                <feDisplacementMap
                  in="SourceGraphic"
                  in2="displacement_map"
                  scale={maximumDisplacement * scaleRatio}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
              <pattern
                id="grid"
                x={-25}
                y={-25}
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                {/* Safari workaround: animate x/y instead of patternTransform */}
                <animate
                  attributeName="x"
                  from="-25"
                  to="25"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y"
                  from="-25"
                  to="25"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="#D7E8E6"
                  strokeWidth="3"
                  opacity={0.8}
                />
              </pattern>
              <linearGradient
                id="doubleGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#4FBDBB" /> {/* Top-left */}
                <stop offset="50%" stopColor="#AFBDBB" /> {/* Center */}
                <stop offset="100%" stopColor="#DFBDBB" /> {/* Bottom-right */}
              </linearGradient>
            </defs>

            <g filter={`url(#${filterId})`}>
              <rect width="400" height="300" fill="url(#doubleGradient)" />
              <rect width="400" height="300" fill="url(#grid)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
