import { type FaviconOptions, favicons } from "favicons";
import { extname, posix } from "node:path";
import type { Plugin } from "vite";

/**
 * A custom Vite plugin to generate favicons.
 */
export default async function faviconsPlugin(
  source: string | Buffer,
  options: FaviconOptions & { path: string },
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
      if (id === resolvedModuleId) {
        const code = [
          "import React from 'react'",
          "export default () =>",
          "React.createElement(React.Fragment,null,",
          htmlHeadTags
            .map(parseTagAttributes)
            .map(
              ([tag, attrs]) =>
                `React.createElement("${tag}",${JSON.stringify(attrs)})`,
            ),
          ");",
        ].join("\n");

        // Vite 8 uses Rolldown, which needs an explicit module type for
        // extensionless virtual modules.
        return { code, moduleType: "js" };
      }
    },

    // Only used in Build Mode
    generateBundle() {
      for (const [name, content] of faviconsFiles.entries()) {
        this.emitFile({
          type: "asset",
          fileName: posix.join(options.path, name).replace(/^\//, ""),
          source: content,
        });
      }
    },

    // Only used in Dev Mode
    configureServer(server) {
      const MIME_TYPES: Record<string, string> = {
        ".ico": "image/x-icon",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
      };
      server.middlewares.use((req, res, next) => {
        const pathname = req.url
          ? new URL(req.url, "http://vite.local").pathname
          : undefined;

        if (pathname?.startsWith(`${options.path.replace(/\/$/, "")}/`)) {
          const filename = pathname
            .slice(options.path.length)
            .replace(/^\//, "");
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
function parseTagAttributes(
  tag: string,
): [tagName: string, attributes: Record<string, string | boolean>] {
  const tagName = tag.match(/^<(\w+)/)?.[1];
  if (!tagName) {
    throw new Error(`Unable to parse favicon HTML tag: ${tag}`);
  }

  const attrRegex = /([^\s=/>]+)(?:="([^"]*)")?/g;
  const attributeSource = tag.slice(tagName.length + 1);
  const reactAttributeNames: Record<string, string> = {
    charset: "charSet",
    class: "className",
    crossorigin: "crossOrigin",
    "http-equiv": "httpEquiv",
    referrerpolicy: "referrerPolicy",
  };
  const attributes: Record<string, string | boolean> = {};
  let match;
  while ((match = attrRegex.exec(attributeSource)) !== null) {
    const [, key, value] = match;
    attributes[reactAttributeNames[key] ?? key] = value || true;
  }
  return [tagName, attributes];
}
