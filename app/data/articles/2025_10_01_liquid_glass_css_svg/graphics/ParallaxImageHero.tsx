import { motion, useScroll, useTransform } from "motion/react";
import { Filter } from "../components/Filter";

const imageUrl =
  "https://images.unsplash.com/photo-1688494930098-e88c53c26e3a?auto=format&q=80&fit=crop&w=1400&h=1600&crop=focalpoint&fp-x=0.3&fp-y=0.5&fp-z=1";
const imageUrlMiddle =
  "https://images.unsplash.com/photo-1688494930098-e88c53c26e3a?auto=format&q=80&fit=crop&w=400&h=700&crop=focalpoint&fp-x=0.3&fp-y=0.6&fp-z=1.9";

export const ParallaxImageHero: React.FC = () => {
  const filterId = "parallax-image-hero-filter";

  // Parallax
  const parallaxSpeed = -0.25;
  const { scrollY } = useScroll();
  const backgroundParallaxOffset = useTransform(
    scrollY,
    (v) => v * parallaxSpeed
  );

  // Glass preset
  const height = 150;
  const width = 150;
  const radius = 75;
  const bezelWidth = 40;
  const glassThickness = 120;
  const refractiveIndex = 1.5;
  const blur = 0;
  const specularOpacity = 0.3;
  const specularSaturation = 5;

  return (
    <>
      <motion.div
        className="relative h-[400px] w-full overflow-hidden rounded-xl bg-slate-600/20 flex items-center justify-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "700px auto",
          backgroundPositionX: "center",
          backgroundPositionY: useTransform(
            () => -60 + backgroundParallaxOffset.get()
          ),
        }}
      >
        {/* Firefox-compatible: apply filter to an SVG <image> overlay instead of CSS filter */}
        <svg
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] overflow-hidden"
          viewBox="0 0 150 150"
          preserveAspectRatio="xMidYMid slice"
          colorInterpolationFilters="sRGB"
          style={{
            pointerEvents: "none",
            borderRadius: "100px",
            boxShadow: "0 16px 31px rgba(0,0,0,0.4)",
          }}
        >
          <Filter
            withSvgWrapper={false}
            id={filterId}
            width={width}
            height={height}
            radius={radius}
            bezelWidth={bezelWidth}
            glassThickness={glassThickness}
            refractiveIndex={refractiveIndex}
            blur={blur}
            specularOpacity={specularOpacity}
            specularSaturation={specularSaturation}
            bezelHeightFn={(x) => Math.pow(1 - Math.pow(1 - x, 4), 1 / 4)} // Squircle (n=4)
          />
          <g filter={`url(#${filterId})`}>
            <motion.image
              href={imageUrlMiddle}
              width="200px"
              style={{
                x: -29,
                y: useTransform(
                  () => 13 + backgroundParallaxOffset.get() * 0.75
                ),
              }}
            />
          </g>
        </svg>
      </motion.div>
    </>
  );
};
