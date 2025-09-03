import { createCanvas } from "canvas";
import type { Plugin } from "vite";

import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
} from "./lib/displacementMap";
import { calculateRefractionSpecular } from "./lib/specular";
import { CONVEX } from "./lib/surfaceEquations";

/**
 * A custom Vite plugin to generate refraction displacement map assets.
 */
export default function refractionDisplacementMapPlugin(): Plugin {
  // Cache for generated maps with different parameters
  const displacementMapCache = new Map<string, Buffer>();
  const specularMapCache = new Map<string, Buffer>();

  // Parse query parameters from virtual module ID
  function parseParams(id: string): {
    width?: number;
    height?: number;
    radius?: number;
    bezelWidth?: number;
    glassThickness?: number;
    refractiveIndex?: number;
    specularOpacity?: number;
    specularSaturation?: number;
    blur?: number;
  } {
    const url = new URL(id);
    const params: any = {};

    if (url.searchParams.has("width"))
      params.width = parseInt(url.searchParams.get("width")!);
    if (url.searchParams.has("height"))
      params.height = parseInt(url.searchParams.get("height")!);
    if (url.searchParams.has("radius"))
      params.radius = parseInt(url.searchParams.get("radius")!);
    if (url.searchParams.has("bezelWidth"))
      params.bezelWidth = parseInt(url.searchParams.get("bezelWidth")!);
    if (url.searchParams.has("glassThickness"))
      params.glassThickness = parseInt(url.searchParams.get("glassThickness")!);
    if (url.searchParams.has("refractiveIndex"))
      params.refractiveIndex = parseFloat(
        url.searchParams.get("refractiveIndex")!
      );
    if (url.searchParams.has("specularOpacity"))
      params.specularOpacity = parseFloat(
        url.searchParams.get("specularOpacity")!
      );
    if (url.searchParams.has("specularSaturation"))
      params.specularSaturation = parseFloat(
        url.searchParams.get("specularSaturation")!
      );
    if (url.searchParams.has("blur"))
      params.blur = parseFloat(url.searchParams.get("blur")!);

    return params;
  }

  // Generate cache key from parameters
  function getCacheKey(params: any): string {
    return JSON.stringify(params);
  }

  // Create filename-safe version of parameters
  function paramsToFilename(params: any): string {
    const entries = Object.entries(params);
    if (entries.length === 0) return "";
    return entries.map(([key, value]) => `${key}=${value}`).join("&");
  }

  // Parse parameters from filename
  function filenameToParams(filename: string): any {
    if (!filename) return {};
    const params: any = {};
    filename.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key && value) {
        // Convert string values back to appropriate types
        if (value === "true") params[key] = true;
        else if (value === "false") params[key] = false;
        else if (!isNaN(Number(value))) params[key] = Number(value);
        else params[key] = value;
      }
    });
    return params;
  }

  function generateDisplacementMap(customParams: any = {}): Buffer {
    // Default parameters (same as ParallaxImageHero component)
    const defaults = {
      height: 150,
      width: 150,
      radius: 75,
      bezelWidth: 40,
      glassThickness: 120,
      refractiveIndex: 1.5,
    };

    // Merge custom parameters with defaults
    const params = { ...defaults, ...customParams };
    const {
      height,
      width,
      radius,
      bezelWidth,
      glassThickness,
      refractiveIndex,
    } = params;

    // Generate the precomputed displacement map using the parameters
    const precomputedMap = calculateDisplacementMap(
      glassThickness,
      bezelWidth,
      CONVEX.fn,
      refractiveIndex
    );

    const maxDisplacement = Math.max(...precomputedMap.map((x) => Math.abs(x)));
    console.log("Max Displacement Value:", maxDisplacement);

    // Generate the displacement map using the dimensions
    const imageData = calculateDisplacementMap2(
      width, // canvasWidth
      height, // canvasHeight
      width, // objectWidth
      height, // objectHeight
      radius, // radius
      bezelWidth, // bezelWidth
      100, // maximumDisplacement
      precomputedMap,
      4 // dpr (device pixel ratio)
    );

    // Convert ImageData to PNG buffer
    const canvas = createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toBuffer("image/png");
  }

  function generateSpecularMap(customParams: any = {}): Buffer {
    // Default parameters (same as ParallaxImageHero component)
    const defaults = {
      height: 150,
      width: 150,
      radius: 75,
      bezelWidth: 40,
      specularOpacity: 0.3,
    };

    // Merge custom parameters with defaults
    const params = { ...defaults, ...customParams };
    const { height, width, radius, bezelWidth, specularOpacity } = params;

    // Generate the specular map
    const imageData = calculateRefractionSpecular(
      width, // objectWidth
      height, // objectHeight
      radius, // radius
      bezelWidth, // bezelWidth
      Math.PI / 4, // specularAngle - 45 degrees
      specularOpacity, // specularOpacity
      4 // dpr (device pixel ratio)
    );

    // Convert ImageData to PNG buffer
    const canvas = createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toBuffer("image/png");
  }

  return {
    name: "vite-plugin-refraction-displacement-map",

    buildStart() {
      // Pre-generate default maps
      const defaultParams = {};
      const defaultKey = getCacheKey(defaultParams);

      if (!displacementMapCache.has(defaultKey)) {
        displacementMapCache.set(
          defaultKey,
          generateDisplacementMap(defaultParams)
        );
      }
      if (!specularMapCache.has(defaultKey)) {
        specularMapCache.set(defaultKey, generateSpecularMap(defaultParams));
      }
    },

    resolveId(id) {
      if (id.startsWith("virtual:refractionDisplacementMap")) {
        return "\0" + id;
      }
      if (id.startsWith("virtual:refractionSpecularMap")) {
        return "\0" + id;
      }
    },

    load(id) {
      if (id.startsWith("\0virtual:refractionDisplacementMap")) {
        const params = parseParams(id.replace("\0", ""));
        const cacheKey = getCacheKey(params);

        // Ensure the displacement map is in cache
        if (!displacementMapCache.has(cacheKey)) {
          const buffer = generateDisplacementMap(params);
          displacementMapCache.set(cacheKey, buffer);
        }

        const filenameParams = paramsToFilename(params);
        const filename = `displacement-map-${filenameParams}.png`;
        return `export default "/assets/${filename}";`;
      }
      if (id.startsWith("\0virtual:refractionSpecularMap")) {
        const params = parseParams(id.replace("\0", ""));
        const cacheKey = getCacheKey(params);

        // Ensure the specular map is in cache
        if (!specularMapCache.has(cacheKey)) {
          const buffer = generateSpecularMap(params);
          specularMapCache.set(cacheKey, buffer);
        }

        const filenameParams = paramsToFilename(params);
        const filename = `specular-map-${filenameParams}.png`;
        return `export default "/assets/${filename}";`;
      }
    },

    // Generate the asset files during build
    generateBundle() {
      // Emit all cached displacement maps
      for (const [cacheKey, buffer] of displacementMapCache) {
        let params: any = {};
        try {
          params = JSON.parse(cacheKey);
        } catch {
          // If JSON parsing fails, it might be the old filename format
          // Just use empty params for fallback
          params = {};
        }
        const filenameParams = paramsToFilename(params);
        const filename = `displacement-map-${filenameParams}.png`;
        this.emitFile({
          type: "asset",
          fileName: `assets/${filename}`,
          source: buffer,
        });
      }

      // Emit all cached specular maps
      for (const [cacheKey, buffer] of specularMapCache) {
        let params: any = {};
        try {
          params = JSON.parse(cacheKey);
        } catch {
          // If JSON parsing fails, it might be the old filename format
          // Just use empty params for fallback
          params = {};
        }
        const filenameParams = paramsToFilename(params);
        const filename = `specular-map-${filenameParams}.png`;
        this.emitFile({
          type: "asset",
          fileName: `assets/${filename}`,
          source: buffer,
        });
      }
    },

    // Handle dev mode by serving both maps directly
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/assets/displacement-map-")) {
          // Extract parameters from filename
          const filename = req.url
            .replace("/assets/displacement-map-", "")
            .replace(".png", "");
          const params = filenameToParams(filename);
          const cacheKey = getCacheKey(params);

          let buffer = displacementMapCache.get(cacheKey);
          if (!buffer) {
            // Generate with parsed parameters
            buffer = generateDisplacementMap(params);
            displacementMapCache.set(cacheKey, buffer);
          }

          res.writeHead(200, {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000",
          });
          res.end(buffer);
          return;
        }

        if (req.url?.startsWith("/assets/specular-map-")) {
          // Extract parameters from filename
          const filename = req.url
            .replace("/assets/specular-map-", "")
            .replace(".png", "");
          const params = filenameToParams(filename);
          const cacheKey = getCacheKey(params);

          let buffer = specularMapCache.get(cacheKey);
          if (!buffer) {
            // Generate with parsed parameters
            buffer = generateSpecularMap(params);
            specularMapCache.set(cacheKey, buffer);
          }

          res.writeHead(200, {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000",
          });
          res.end(buffer);
          return;
        }
        next();
      });
    },

    // Handle hot updates for development
    async handleHotUpdate({ file, server }) {
      if (file.includes("displacementMap.ts") || file.includes("specular.ts")) {
        // Clear all caches if source files change
        displacementMapCache.clear();
        specularMapCache.clear();

        // Reload all virtual modules
        const modules = Array.from(server.moduleGraph.idToModuleMap.keys())
          .filter((id) => id.startsWith("\0virtual:refraction"))
          .map((id) => server.moduleGraph.getModuleById(id))
          .filter((module): module is NonNullable<typeof module> =>
            Boolean(module)
          );

        for (const module of modules) {
          server.reloadModule(module);
        }
      }
    },
  };
}
