import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { LogoStatic } from "../../../components/Logo";
import { Filter } from "./Filter";

function ResizedUnsplashUrl(
  id: string,
  {
    width,
    height,
    x,
    y,
  }: {
    width?: string;
    height?: string;
    x?: string;
    y?: string;
  }
): string {
  return `https://images.unsplash.com/${id}?fit=crop&w=${width}&h=${height}&crop=center`;
}

export const VideoHero: React.FC = () => {
  const filterId = "video-hero-filter";
  const heroRef = useRef<HTMLDivElement | null>(null);
  // const unsplashPhotoId = "photo-1538970272646-f61fabb3a8a2";
  // const unsplashPhotoId = "photo-1620121684840-edffcfc4b878";
  // const unsplashPhotoId = "photo-1599033153041-e88627ca70bb";
  // const unsplashPhotoId = "photo-1753087380647-38a2496b60bc";
  // const unsplashPhotoId = "photo-1501436513145-30f24e19fcc8";
  // const unsplashPhotoId = "photo-1522911715181-6ce196f07c76";
  // const unsplashPhotoId = "photo-1540206395-68808572332f";
  // const unsplashPhotoId = "photo-1525310072745-f49212b5ac6d";
  const unsplashPhotoId = "photo-1487139975590-b4f1dce9b035";
  // const unsplashPhotoId = "photo-1447875569765-2b3db822bec9";
  // const unsplashPhotoId = "photo-1546842931-886c185b4c8c";
  // const unsplashPhotoId = "photo-1464820453369-31d2c0b651af";
  // const unsplashPhotoId = "photo-1534211698458-e2be12c1a94c";
  // const unsplashPhotoId = "photo-1534162802244-d6f69e9048da";
  // const unsplashPhotoId = "photo-1573261658953-8b29e144d1af";
  // const unsplashPhotoId = "photo-1594926981043-a26841c5a492";

  const parallaxBaseOffset = -90;
  const parallaxSpeed = -0.27;

  // Parallax state
  const { scrollY } = useScroll();

  const blur = 0;
  const specularOpacity = 0.4;

  const height = 150;
  const width = 150;
  const radius = 75;
  const bezelWidth = 40;
  const glassThickness = 90;
  const refractiveIndex = 1.5;

  const backgroundParallaxOffset = useTransform(
    () => parallaxBaseOffset + scrollY.get() * parallaxSpeed
  );

  return (
    <>
      <motion.div
        className="relative aspect-[5/3] w-full overflow-hidden rounded-xl bg-red-300 flex items-center justify-center"
        style={{
          backgroundImage: `url(${ResizedUnsplashUrl(unsplashPhotoId, {
            width: "1000",
          })})`,
          backgroundSize: "cover",
          backgroundPositionY: backgroundParallaxOffset,
        }}
        ref={heroRef}
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
              href={ResizedUnsplashUrl(unsplashPhotoId, {
                width: "800",
                // height: "600",
              })}
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
              gradientId="video-hero-logo-gradient"
              gradientFrom="rgba(255,255,255,0.6)"
              gradientTo="rgba(255,255,255,0.9)"
            />
          </motion.div>
        </motion.button>
      </motion.div>
    </>
  );
};
