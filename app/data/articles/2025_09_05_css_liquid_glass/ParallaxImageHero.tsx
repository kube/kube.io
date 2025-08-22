import { motion, useScroll, useTransform } from "motion/react";
import { LogoStatic } from "../../../components/Logo";
import { Filter } from "./Filter";

// Tiny helper to request a centered cropped Unsplash image at a given width
const unsplashUrl = (id: string, width?: string) =>
  `https://images.unsplash.com/${id}?fit=crop&crop=center${
    width ? `&w=${width}` : ""
  }`;

export const ParallaxImageHero: React.FC = () => {
  const filterId = "parallax-image-hero-filter";
  const unsplashPhotoId = "photo-1487139975590-b4f1dce9b035"; // change to taste

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
  const specularOpacity = 0.4;

  return (
    <>
      <motion.div
        className="relative aspect-[5/3] w-full overflow-hidden rounded-xl bg-red-300 flex items-center justify-center"
        style={{
          backgroundImage: `url(${unsplashUrl(unsplashPhotoId, "1000")})`,
          backgroundSize: "cover",
          backgroundPositionY: backgroundParallaxOffset,
        }}
      >
        {/* Firefox-compatible: apply filter to an SVG <image> overlay instead of CSS filter */}
        <svg
          className="w-[30%] aspect-square"
          viewBox="0 0 150 150"
          preserveAspectRatio="xMidYMid slice"
          color-interpolation-filters="sRGB"
          style={{
            pointerEvents: "none",
            borderRadius: `100%`,
            boxShadow: "0 2px 20px rgba(0,0,0,0.2)",
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
          />
          <g filter={`url(#${filterId})`}>
            <motion.image
              href={unsplashUrl(unsplashPhotoId, "800")}
              width="100%"
              preserveAspectRatio="xMidYMid slice"
              style={{ y: backgroundParallaxOffset }}
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
              gradientFrom="rgba(255,255,255,0.6)"
              gradientTo="rgba(255,255,255,0.9)"
            />
          </motion.div>
        </motion.button>
      </motion.div>
    </>
  );
};
