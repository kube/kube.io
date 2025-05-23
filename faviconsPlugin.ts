import { type FaviconOptions, favicons } from "favicons";
import { extname, join, relative } from "path";
import type { Plugin } from "vite";

/**
 * A custom Vite plugin to generate favicons.
 */
export default async function faviconsPlugin(
  source: string | Buffer,
  options: FaviconOptions & { path: string }
): Promise<Plugin> {
  // Create cache for all generated files
  const faviconsFiles = new Map<string, string | Buffer>();
  let htmlHeadTags: string[] = [];

  async function compileFavicons() {
    // Generate Favicons
    const faviconsOutput = await favicons(source, options);

    for (const item of [...faviconsOutput.images, ...faviconsOutput.files]) {
      faviconsFiles.set(item.name, item.contents);
    }
    htmlHeadTags = faviconsOutput.html;
  }

  // Virtual Module ID for importing React <Favicons /> component
  const virtualModuleId = "virtual:favicons";
  const resolvedModuleId = "\0" + virtualModuleId;

  return {
    name: "vite-plugin-kube-favicons",

    async buildStart() {
      await compileFavicons();
    },

    resolveId(id) {
      if (id === virtualModuleId) return resolvedModuleId;
    },

    load(id) {
      if (id === resolvedModuleId)
        return [
          "import React from 'react'",
          "export default () =>",
          "React.createElement(React.Fragment,null,",
          htmlHeadTags
            .map(parseTagAttributes)
            .map(
              ([tag, attrs]) =>
                `React.createElement("${tag}",${JSON.stringify(attrs)})`
            ),
          ");",
        ].join("\n");
    },

    // Only used in Build Mode
    generateBundle() {
      for (const [name, content] of faviconsFiles.entries()) {
        this.emitFile({
          type: "asset",
          fileName: join(options.path, name),
          source: content,
        });
      }
    },

    // Only used in Dev Mode
    configureServer(server) {
      const MIME_TYPES = {
        ".ico": "image/x-icon",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
      };
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith(options.path)) {
          const filename = relative(options.path, req.url);
          const resource = faviconsFiles.get(filename);

          if (resource) {
            res.writeHead(200, {
              "Content-Type":
                MIME_TYPES[extname(filename)] ?? "application/octet-stream",
              "Cache-Control": "public, max-age=31536000",
            });
            res.end(resource);
            return;
          }
        }
        next();
      });
    },
  };
}

/**
 * Helper for parsing HTML tag attributes from favicons library
 */
function parseTagAttributes(tag: string) {
  const attrRegex = /(\w+)(?:="([^"]*)")?/g;
  const attributes = {};
  let match;
  while ((match = attrRegex.exec(tag)) !== null) {
    const [, key, value] = match;
    if (key !== tag.split(" ")[0].slice(1)) {
      attributes[key] = value || true;
    }
  }
  return [`${tag.match(/^<(\w+)/)?.[1]}`, attributes];
}
