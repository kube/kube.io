/// <reference types="vite/client" />

declare module "virtual:favicons" {
  import React from "react";
  const Favicons: React.FC;
  export default Favicons;
}

declare module "virtual:refractionDisplacementMap" {
  const displacementMapUrl: string;
  export default displacementMapUrl;
}

declare module "virtual:refractionSpecularMap" {
  const specularMapUrl: string;
  export default specularMapUrl;
}

// Support for parameterized virtual modules
declare module "virtual:refractionDisplacementMap*" {
  const displacementMapUrl: string;
  export default displacementMapUrl;
}

declare module "virtual:refractionSpecularMap*" {
  const specularMapUrl: string;
  export default specularMapUrl;
}

declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}
