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
  // Cache for generated maps
  let displacementMapBuffer: Buffer | null = null;
  let specularMapBuffer: Buffer | null = null;

  function generateDisplacementMap(): Buffer {
    // Use the same parameters as ParallaxImageHero component
    const height = 150;
    const width = 150;
    const radius = 75;
    const bezelWidth = 40;
    const glassThickness = 120;
    const refractiveIndex = 1.5;

    // Generate the precomputed displacement map using the same parameters as the Filter component
    const precomputedMap = calculateDisplacementMap(
      glassThickness,
      bezelWidth,
      CONVEX.fn,
      refractiveIndex
    );

    const maxDisplacement = Math.max(...precomputedMap.map((x) => Math.abs(x)));
    console.log("Max Displacement Value:", maxDisplacement);

    // Generate the displacement map using the same dimensions as the component
    const size = 150;
    const imageData = calculateDisplacementMap2(
      size, // canvasWidth
      size, // canvasHeight
      width, // objectWidth - matches component width
      height, // objectHeight - matches component height
      radius, // radius - matches component radius
      bezelWidth, // bezelWidth - matches component bezelWidth
      100, // maximumDisplacement
      precomputedMap,
      3 // dpr (device pixel ratio)
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

  function generateSpecularMap(): Buffer {
    // Use the same parameters as ParallaxImageHero component
    const height = 150;
    const width = 150;
    const radius = 75;
    const bezelWidth = 40;
    const specularOpacity = 0.3;

    // Generate the specular map
    const imageData = calculateRefractionSpecular(
      width, // objectWidth - matches component width
      height, // objectHeight - matches component height
      radius, // radius - matches component radius
      bezelWidth, // bezelWidth - matches component bezelWidth
      Math.PI / 4, // specularAngle - 45 degrees
      specularOpacity, // specularOpacity - matches component
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

  // Virtual Module IDs
  const virtualModuleId = "virtual:refractionDisplacementMap";
  const resolvedModuleId = "\0" + virtualModuleId;
  const specularModuleId = "virtual:refractionSpecularMap";
  const resolvedSpecularModuleId = "\0" + specularModuleId;

  return {
    name: "vite-plugin-refraction-displacement-map",

    buildStart() {
      // Generate both maps during build start
      if (!displacementMapBuffer) {
        displacementMapBuffer = generateDisplacementMap();
      }
      if (!specularMapBuffer) {
        specularMapBuffer = generateSpecularMap();
      }
    },

    resolveId(id) {
      if (id === virtualModuleId) return resolvedModuleId;
      if (id === specularModuleId) return resolvedSpecularModuleId;
    },

    load(id) {
      if (id === resolvedModuleId) {
        // For dev mode, return dev server path
        // For build mode, this will be handled by generateBundle hook
        return 'export default "/assets/displacement-map.png";';
      }
      if (id === resolvedSpecularModuleId) {
        return 'export default "/assets/specular-map.png";';
      }
    },

    // Generate the asset files during build
    generateBundle() {
      if (displacementMapBuffer) {
        this.emitFile({
          type: "asset",
          fileName: "assets/displacement-map.png",
          source: displacementMapBuffer,
        });
      }
      if (specularMapBuffer) {
        this.emitFile({
          type: "asset",
          fileName: "assets/specular-map.png",
          source: specularMapBuffer,
        });
      }
    },

    // Handle dev mode by serving both maps directly
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/assets/displacement-map.png") {
          if (!displacementMapBuffer) {
            displacementMapBuffer = generateDisplacementMap();
          }

          res.writeHead(200, {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000",
          });
          res.end(displacementMapBuffer);
          return;
        }
        if (req.url === "/assets/specular-map.png") {
          if (!specularMapBuffer) {
            specularMapBuffer = generateSpecularMap();
          }

          res.writeHead(200, {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000",
          });
          res.end(specularMapBuffer);
          return;
        }
        next();
      });
    },

    // Handle hot updates for development
    async handleHotUpdate({ file, server }) {
      if (file.includes("displacementMap.ts") || file.includes("specular.ts")) {
        // Regenerate both maps if source files change
        displacementMapBuffer = null;
        specularMapBuffer = null;
        const displacementModule =
          server.moduleGraph.getModuleById(resolvedModuleId);
        const specularModule = server.moduleGraph.getModuleById(
          resolvedSpecularModuleId
        );
        if (displacementModule) {
          server.reloadModule(displacementModule);
        }
        if (specularModule) {
          server.reloadModule(specularModule);
        }
      }
    },
  };
}
