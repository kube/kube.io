import { motion, useScroll, useTransform } from "motion/react";
import { LogoStatic } from "../../../../components/Logo";
import { Filter } from "../components/Filter";
import coverAUrl from "../images/cover.jpg";

export const ParallaxImageHero: React.FC = () => {
  const filterId = "parallax-image-hero-filter";

  // Parallax
  const parallaxBaseOffset = -90;
  const parallaxSpeed = -0.27;
  const { scrollY } = useScroll();
  const backgroundParallaxOffset = useTransform(
    scrollY,
    (v) => parallaxBaseOffset + v * parallaxSpeed
  );

  // Glass preset
  const height = 150;
  const width = 150;
  const radius = 75;
  const bezelWidth = 40;
  const glassThickness = 90;
  const refractiveIndex = 1.5;
  const blur = 0;
  const specularOpacity = 0.2;
  const specularSaturation = 10;

  return (
    <>
      <motion.div
        className="relative aspect-[5/3] w-full overflow-hidden rounded-xl bg-red-300 flex items-center justify-center"
        style={{
          backgroundImage: `url(${coverAUrl})`,
          backgroundSize: "cover",
          backgroundPositionY: useTransform(
            () => 80 + backgroundParallaxOffset.get()
          ),
        }}
      >
        {/* Firefox-compatible: apply filter to an SVG <image> overlay instead of CSS filter */}
        <svg
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] overflow-hidden"
          viewBox="0 0 150 150"
          preserveAspectRatio="xMidYMid slice"
          color-interpolation-filters="sRGB"
          style={{
            pointerEvents: "none",
            borderRadius: "100px",
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
          />
          <g filter={`url(#${filterId})`}>
            <motion.image
              href={coverAUrl}
              width="362%"
              style={{
                x: -195,
                y: useTransform(() => backgroundParallaxOffset.get()),
              }}
            />
          </g>
        </svg>

        <motion.button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            height,
            width,
            borderRadius: `${radius}px`,
          }}
        >
          <motion.div className="relative h-full w-full flex items-center justify-center">
            <LogoStatic
              className="w-20"
              gradientId="parallax-image-hero-logo-gradient"
              gradientFrom="rgba(36,33,33,0.5)"
              gradientTo="rgba(36,33,33,0.7)"
            />
          </motion.div>
        </motion.button>
      </motion.div>
    </>
  );
};
