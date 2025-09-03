// Type declarations for virtual modules
declare module "virtual:refractionDisplacementMap*" {
  export const url: string;
  export const maxDisplacement: number;
  const data: {
    url: string;
    maxDisplacement: number;
  };
  export default data;
}

declare module "virtual:refractionSpecularMap*" {
  const url: string;
  export default url;
}

declare module "virtual:refractionFilter*" {
  import { MotionValue } from "motion/react";

  interface FilterProps {
    id: string;
    withSvgWrapper?: boolean;
    blur?: number | MotionValue<number>;
    scaleRatio?: number | MotionValue<number>;
    specularOpacity?: number | MotionValue<number>;
    specularSaturation?: number | MotionValue<number>;
    width?: number;
    height?: number;
  }

  export const Filter: React.ComponentType<FilterProps>;
  export default Filter;
}
