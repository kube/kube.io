/// <reference types="vite/client" />

declare module "virtual:favicons" {
  import React from "react";
  const Favicons: React.FC;
  export default Favicons;
}

declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}
