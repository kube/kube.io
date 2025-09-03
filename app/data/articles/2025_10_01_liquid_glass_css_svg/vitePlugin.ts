import { createCanvas } from "canvas";
import type { Plugin } from "vite";

import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
} from "./lib/displacementMap";
import { calculateMagnifyingDisplacementMap } from "./lib/magnifyingDisplacement";
import { calculateRefractionSpecular } from "./lib/specular";
import { CONCAVE, CONVEX, CONVEX_CIRCLE, LIP } from "./lib/surfaceEquations";

/**
 * A custom Vite plugin to generate refraction displacement map assets.
 */
export default function refractionDisplacementMapPlugin(): Plugin {
  // Cache for generated maps with different parameters
  const displacementMapCache = new Map<
    string,
    { buffer: Buffer; maxDisplacement: number }
  >();
  const specularMapCache = new Map<string, Buffer>();
  const magnifyingMapCache = new Map<string, Buffer>();

  // Hash to params mapping for dev server
  const hashToParamsMap = new Map<string, any>();

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
    magnify?: boolean;
    bezelType?: "convex_circle" | "convex_squircle" | "concave" | "lip";
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
    if (url.searchParams.has("magnify"))
      params.magnify = url.searchParams.get("magnify") === "true";
    if (url.searchParams.has("bezelType")) {
      const bezelType = url.searchParams.get("bezelType");
      if (
        bezelType === "convex_circle" ||
        bezelType === "convex_squircle" ||
        bezelType === "concave" ||
        bezelType === "lip"
      ) {
        params.bezelType = bezelType;
      }
    }

    return params;
  }

  // Generate cache key from parameters
  function getCacheKey(params: any): string {
    return JSON.stringify(params);
  }

  // Generate hash from parameters for filename and store mapping for dev server
  function paramsToHash(params: any): string {
    const str = JSON.stringify(params);
    let hash = 0;
    if (str.length === 0) return hash.toString(36);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const hashString = Math.abs(hash).toString(36);
    // Store the mapping for dev server
    hashToParamsMap.set(hashString, params);
    return hashString;
  }

  // Get params from hash
  function hashToParams(hashString: string): any {
    return hashToParamsMap.get(hashString) || {};
  }

  function generateDisplacementMap(customParams: any = {}): {
    buffer: Buffer;
    maxDisplacement: number;
  } {
    // Default parameters (same as ParallaxImageHero component)
    const defaults = {
      height: 150,
      width: 150,
      radius: 75,
      bezelWidth: 40,
      glassThickness: 120,
      refractiveIndex: 1.5,
      bezelType: "convex_squircle",
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
      bezelType,
    } = params;

    // Select the appropriate surface function based on bezelType
    let surfaceFn;
    switch (bezelType) {
      case "convex_circle":
        surfaceFn = CONVEX_CIRCLE.fn;
        break;
      case "convex_squircle":
        surfaceFn = CONVEX.fn;
        break;
      case "concave":
        surfaceFn = CONCAVE.fn;
        break;
      case "lip":
        surfaceFn = LIP.fn;
        break;
      default:
        surfaceFn = CONVEX.fn;
    }

    // Generate the precomputed displacement map using the parameters
    const precomputedMap = calculateDisplacementMap(
      glassThickness,
      bezelWidth,
      surfaceFn,
      refractiveIndex
    );

    const maxDisplacement = Math.max(...precomputedMap.map((x) => Math.abs(x)));
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
      2 // dpr (device pixel ratio)
    );

    // Convert ImageData to PNG buffer
    const canvas = createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    ctx.putImageData(imageData, 0, 0);

    return {
      buffer: canvas.toBuffer("image/png"),
      maxDisplacement,
    };
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
      2 // dpr (device pixel ratio)
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

  function generateMagnifyingMap(customParams: any = {}): Buffer {
    // Default parameters (same as MagnifyingGlass component)
    const defaults = {
      width: 210,
      height: 150,
    };

    // Merge custom parameters with defaults
    const params = { ...defaults, ...customParams };
    const { width, height } = params;

    // Generate the magnifying displacement map
    const imageData = calculateMagnifyingDisplacementMap(width, height);

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
      if (id.startsWith("virtual:magnifying-scale")) {
        return "\0" + id;
      }
      if (id.startsWith("virtual:refractionFilter")) {
        return "\0" + id + ".tsx";
      }
    },

    load(id) {
      if (id.startsWith("\0virtual:refractionDisplacementMap")) {
        const params = parseParams(id.replace("\0", ""));
        const cacheKey = getCacheKey(params);

        // Ensure the displacement map is in cache
        if (!displacementMapCache.has(cacheKey)) {
          const result = generateDisplacementMap(params);
          displacementMapCache.set(cacheKey, result);
        }

        const cachedResult = displacementMapCache.get(cacheKey)!;
        const filenameHash = paramsToHash(params);
        const filename = `displacement-map-${filenameHash}.png`;

        return `export const url = "/assets/${filename}";
export const maxDisplacement = ${cachedResult.maxDisplacement};
export default { url: "/assets/${filename}", maxDisplacement: ${cachedResult.maxDisplacement} };`;
      }
      if (id.startsWith("\0virtual:refractionSpecularMap")) {
        const params = parseParams(id.replace("\0", ""));
        const cacheKey = getCacheKey(params);

        // Ensure the specular map is in cache
        if (!specularMapCache.has(cacheKey)) {
          const buffer = generateSpecularMap(params);
          specularMapCache.set(cacheKey, buffer);
        }

        const filenameHash = paramsToHash(params);
        const filename = `specular-map-${filenameHash}.png`;
        return `export default "/assets/${filename}";`;
      }
      if (id.startsWith("\0virtual:magnifying-scale")) {
        const params = parseParams(id.replace("\0", ""));
        const cacheKey = getCacheKey(params);

        // Ensure the magnifying map is in cache
        if (!magnifyingMapCache.has(cacheKey)) {
          const buffer = generateMagnifyingMap(params);
          magnifyingMapCache.set(cacheKey, buffer);
        }

        const filenameHash = paramsToHash(params);
        const filename = `magnifying-map-${filenameHash}.png`;
        return `export default "/assets/${filename}";`;
      }
      if (id.startsWith("\0virtual:refractionFilter")) {
        const params = parseParams(id.replace("\0", "").replace(".tsx", ""));
        const displacementCacheKey = getCacheKey(params);
        const specularCacheKey = getCacheKey(params);

        // Ensure both maps are in cache
        if (!displacementMapCache.has(displacementCacheKey)) {
          const result = generateDisplacementMap(params);
          displacementMapCache.set(displacementCacheKey, result);
        }
        if (!specularMapCache.has(specularCacheKey)) {
          const buffer = generateSpecularMap(params);
          specularMapCache.set(specularCacheKey, buffer);
        }

        // Conditionally generate magnifying map only if magnify=true
        let magnifyingFilename = "";
        if (params.magnify) {
          const magnifyingParams = {
            width: params.width,
            height: params.height,
          };
          const magnifyingCacheKey = getCacheKey(magnifyingParams);
          if (!magnifyingMapCache.has(magnifyingCacheKey)) {
            const buffer = generateMagnifyingMap(magnifyingParams);
            magnifyingMapCache.set(magnifyingCacheKey, buffer);
          }
          const magnifyingFilenameHash = paramsToHash(magnifyingParams);
          magnifyingFilename = `magnifying-map-${magnifyingFilenameHash}.png`;
        }

        const cachedResult = displacementMapCache.get(displacementCacheKey)!;
        const filenameHash = paramsToHash(params);
        const displacementFilename = `displacement-map-${filenameHash}.png`;
        const specularFilename = `specular-map-${filenameHash}.png`;

        // Return a React component that uses the generated assets
        return `
/** @jsx React.createElement */
import React from "react";
import { motion, useTransform } from "motion/react";

const displacementMapAsset = "/assets/${displacementFilename}";
const specularMapAsset = "/assets/${specularFilename}";
${
  params.magnify
    ? `const magnifyingMapAsset = "/assets/${magnifyingFilename}";`
    : ""
}
const maxDisplacement = ${cachedResult.maxDisplacement};

export const Filter = ({
  id,
  withSvgWrapper = true,
  blur = 0.2,
  scaleRatio = 1,
  specularOpacity = 0.4,
  specularSaturation = 4,
  ${params.magnify ? "magnifyingScale," : ""}
  width = ${params.width || 150},
  height = ${params.height || 150},
}) => {
  // Calculate final scale using maxDisplacement and scaleRatio
  const scale = useTransform(() => {
    const ratio = typeof scaleRatio === "number" ? scaleRatio : scaleRatio.get();
    return maxDisplacement * ratio;
  });

  // Convert specularSaturation to string format for feColorMatrix
  const specularSaturationValue = useTransform(() => {
    const value =
      typeof specularSaturation === "number"
        ? specularSaturation
        : specularSaturation.get();
    return value.toString();
  });

  const content = React.createElement("filter", { id: id, filterRes: "128" },
    ${
      params.magnify
        ? `
    // Magnifying displacement map elements (when magnify=true)
    React.createElement("feImage", {
      href: magnifyingMapAsset,
      x: 0,
      y: 0,
      width: width,
      height: height,
      result: "magnifying_displacement_map"
    }),
    React.createElement(motion.feDisplacementMap, {
      in: "SourceGraphic",
      in2: "magnifying_displacement_map",
      scale: typeof magnifyingScale === "number" ? magnifyingScale : magnifyingScale,
      xChannelSelector: "R",
      yChannelSelector: "G",
      result: "magnified_source"
    }),
    `
        : ""
    }
    React.createElement(motion.feGaussianBlur, {
      in: ${params.magnify ? '"magnified_source"' : '"SourceGraphic"'},
      stdDeviation: blur,
      result: "blurred_source"
    }),
    React.createElement("feImage", {
      href: displacementMapAsset,
      x: 0,
      y: 0,
      width: width,
      height: height,
      result: "displacement_map"
    }),
    React.createElement(motion.feDisplacementMap, {
      in: "blurred_source",
      in2: "displacement_map",
      scale: scale,
      xChannelSelector: "R",
      yChannelSelector: "G",
      result: "displaced"
    }),
    React.createElement(motion.feColorMatrix, {
      in: "displaced",
      type: "saturate",
      values: specularSaturationValue,
      result: "displaced_saturated"
    }),
    React.createElement("feImage", {
      href: specularMapAsset,
      x: 0,
      y: 0,
      width: width,
      height: height,
      result: "specular_layer"
    }),
    React.createElement("feComposite", {
      in: "displaced_saturated",
      in2: "specular_layer",
      operator: "in",
      result: "specular_saturated"
    }),
    React.createElement("feComponentTransfer", { in: "specular_layer", result: "specular_faded" },
      React.createElement(motion.feFuncA, { type: "linear", slope: specularOpacity })
    ),
    React.createElement("feBlend", {
      in: "specular_saturated",
      in2: "displaced",
      mode: "normal",
      result: "withSaturation"
    }),
    React.createElement("feBlend", {
      in: "specular_faded",
      in2: "withSaturation",
      mode: "normal"
    })
  );

  return withSvgWrapper ? React.createElement("svg", {
    colorInterpolationFilters: "sRGB",
    style: { display: "none" }
  },
    React.createElement("defs", null, content)
  ) : content;
};

export default Filter;
`;
      }
    },

    // Generate the asset files during build
    generateBundle() {
      // Emit all cached displacement maps
      for (const [cacheKey, result] of displacementMapCache) {
        let params: any = {};
        try {
          params = JSON.parse(cacheKey);
        } catch {
          // If JSON parsing fails, it might be the old filename format
          // Just use empty params for fallback
          params = {};
        }
        const filenameHash = paramsToHash(params);
        const filename = `displacement-map-${filenameHash}.png`;
        this.emitFile({
          type: "asset",
          fileName: `assets/${filename}`,
          source: result.buffer,
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
        const filenameHash = paramsToHash(params);
        const filename = `specular-map-${filenameHash}.png`;
        this.emitFile({
          type: "asset",
          fileName: `assets/${filename}`,
          source: buffer,
        });
      }

      // Emit all cached magnifying maps
      for (const [cacheKey, buffer] of magnifyingMapCache) {
        let params: any = {};
        try {
          params = JSON.parse(cacheKey);
        } catch {
          // If JSON parsing fails, it might be the old filename format
          // Just use empty params for fallback
          params = {};
        }
        const filenameHash = paramsToHash(params);
        const filename = `magnifying-map-${filenameHash}.png`;
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
          // Extract hash from filename
          const hashString = req.url
            .replace("/assets/displacement-map-", "")
            .replace(".png", "");
          const params = hashToParams(hashString);
          const cacheKey = getCacheKey(params);

          let result = displacementMapCache.get(cacheKey);
          if (!result) {
            // Generate with parsed parameters
            result = generateDisplacementMap(params);
            displacementMapCache.set(cacheKey, result);
          }

          res.writeHead(200, {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000",
          });
          res.end(result.buffer);
          return;
        }

        if (req.url?.startsWith("/assets/specular-map-")) {
          // Extract hash from filename
          const hashString = req.url
            .replace("/assets/specular-map-", "")
            .replace(".png", "");
          const params = hashToParams(hashString);
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

        if (req.url?.startsWith("/assets/magnifying-map-")) {
          // Extract hash from filename
          const hashString = req.url
            .replace("/assets/magnifying-map-", "")
            .replace(".png", "");
          const params = hashToParams(hashString);
          const cacheKey = getCacheKey(params);

          let buffer = magnifyingMapCache.get(cacheKey);
          if (!buffer) {
            // Generate with parsed parameters
            buffer = generateMagnifyingMap(params);
            magnifyingMapCache.set(cacheKey, buffer);
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
      if (
        file.includes("displacementMap.ts") ||
        file.includes("specular.ts") ||
        file.includes("magnifyingDisplacement.ts")
      ) {
        // Clear all caches if source files change
        displacementMapCache.clear();
        specularMapCache.clear();
        magnifyingMapCache.clear();

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
