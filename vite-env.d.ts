/// <reference types="vite/client" />

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
