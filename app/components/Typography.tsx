import { motion } from "motion/react";
import { use } from "react";
import { GlobalInitialRenderContext } from "../contexts/GlobalInitialRenderContext";

export const H1: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isGlobalInitialRender = use(GlobalInitialRenderContext);

  return (
    <motion.div
      initial={!isGlobalInitialRender && { y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 130,
        damping: 20,
        mass: 0.4,
      }}
    >
      <h1 className="text-[4rem] leading-[4rem] lg:text-[6rem] lg:leading-[5.8rem] md:text-[5rem] md:leading-[4.8rem] tracking-wide font-bold">
        {children}
      </h1>
    </motion.div>
  );
};

export const H2: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h2 className="text-[3rem] max-sm:text-[2.5rem] tracking-wide leading-[2.8rem] max-sm:leading-[2.3rem] font-light">
    {children}
  </h2>
);
