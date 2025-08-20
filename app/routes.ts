import { index, route, type RouteConfig } from "@react-router/dev/routes";

import { FLAGS } from "./flags.ts";

export default [
  index("./routes/hello/page.tsx"),
  route("cv", "./routes/cv/page.tsx"),
  route("cv.pdf", "./routes/cv/pdf.tsx"),
  route("blog", "./routes/blog/index.tsx"),
  route("blog/:slug", "./routes/blog/post.tsx"),
  ...(FLAGS.WORKSHOP ? [route("workshop", "./routes/workshop/page.tsx")] : []),
] satisfies RouteConfig;
