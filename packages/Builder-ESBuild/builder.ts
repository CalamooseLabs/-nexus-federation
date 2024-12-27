// @ts-self-types="./builder.d.ts"

import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import { basename, dirname, fromFileUrl, join, toFileUrl } from "@std/path";

import { Builder } from "@calamooselabs/kintsugi/builder";

/**
 * The Builder class is responsible for building the modules from the source code.
 * It will take in the source code and return code that can be understood by the requested environment, whether that be Deno or a browser.
 * Builder will take an import map and use that to resolve the imports, this will allow for the use of aliases in the source code.
 *
 * What this needs to do will be determined by the loader class. As loader needs to be able to specify what should be loaded and builder will decide how to bundle.
 */
export class ESBuildBuilder extends Builder {
  constructor() {
    super();
  }

  public override async bundle(
    options: KintsugiBuilder.BundleOptions,
  ): Promise<KintsugiBuilder.BundleResult> {
    const {
      entryPoint,
      target,
      minify = true,
      importMap = {} as KintsugiBuilder.BundleOptions["importMap"],
      compilerOptions,
      splitting = false,
      externals = [],
    } = options;

    // Process import map for relative paths
    const processedImportMap = { imports: {} as Record<string, string> };

    if (importMap?.imports) {
      for (const [key, value] of Object.entries(importMap.imports)) {
        if (value.startsWith(".") && entryPoint.startsWith(".")) {
          const relativePath = entryPoint.replace(/\/[\d\w-_ ]+?\..+?$/, "");
          const absolutePath = join(
            dirname(fromFileUrl(import.meta.url)),
            relativePath,
          );
          processedImportMap.imports[key] =
            toFileUrl(join(absolutePath, value)).href;
        } else {
          processedImportMap.imports[key] = value;
        }
      }
    }

    const importMapURL = `data:application/json,${
      encodeURIComponent(JSON.stringify(processedImportMap))
    }`;

    // Handle externals
    const externalPatterns = externals.flatMap((ext) => [
      ext,
      `${ext}/*`,
      ...(ext.startsWith("@std/") ? [`https://jsr.io/${ext}/*`] : []),
    ]);

    const baseConfig: esbuild.BuildOptions = {
      entryPoints: [entryPoint],
      bundle: true,
      write: false,
      minify,
      sourcemap: true,
      format: "esm",
      target: target === "browser" ? ["es2020"] : [`deno${Deno.version.deno}`],
      platform: target === "browser" ? "browser" : "neutral",
      treeShaking: true,
      splitting,
      outdir: "dist",
      metafile: true,
      chunkNames: "chunks/[name]-[hash]",
      external: externalPatterns,
      plugins: [
        {
          name: "external-resolver",
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              const isExternal = externals.some((ext) =>
                args.path === ext ||
                args.path.startsWith(`${ext}/`) ||
                args.path.startsWith(`https://jsr.io/${ext}/`)
              );

              if (isExternal) {
                return { external: true, path: args.path };
              }
              return null;
            });
          },
        },
        ...denoPlugins({
          importMapURL,
          nodeModulesDir: "none",
          loader: "native",
        }),
      ],
    };

    // Apply compiler options
    if (compilerOptions) {
      for (const [key, value] of Object.entries(compilerOptions)) {
        (baseConfig[key as keyof esbuild.BuildOptions] as esbuild.BuildOptions[
          keyof esbuild.BuildOptions
        ]) = value;
      }
    }

    try {
      const result = await esbuild.build(baseConfig);
      const outputFiles = result.outputFiles || [];

      // Get main file and chunks
      const mainFile = outputFiles.find((f) =>
        !f.path.endsWith(".map") &&
        !f.path.includes("/chunks/") &&
        (f.path.endsWith(".js") || f.path.endsWith(".jsx") ||
          f.path.endsWith(".ts") || f.path.endsWith(".tsx"))
      );

      if (!mainFile) {
        throw new Error("No main output file found");
      }

      // Process chunks and create URL map
      const chunks: Record<string, { code: string; importURL: string }> = {};
      const chunkFiles = outputFiles.filter((f) =>
        f.path.includes("/chunks/") && !f.path.endsWith(".map")
      );

      // Create data URLs for chunks and store the mapping
      const chunkUrlMapping = new Map<string, string>();
      for (const chunk of chunkFiles) {
        const chunkName = basename(chunk.path);
        const encodedChunk = encodeURIComponent(chunk.text);
        const dataUrl =
          `data:application/javascript;charset=utf-8,${encodedChunk}`;
        chunkUrlMapping.set(chunkName, dataUrl);

        chunks[chunkName] = {
          code: chunk.text,
          importURL: dataUrl,
        };
      }

      // Replace chunk references in the main bundle
      let bundledCode = mainFile.text;
      for (const [chunkName, dataUrl] of chunkUrlMapping.entries()) {
        bundledCode = bundledCode.replace(
          new RegExp(`"./chunks/${chunkName}"`, "g"),
          `"${dataUrl}"`,
        );
      }

      return {
        code: bundledCode,
        chunks: Object.keys(chunks).length > 0 ? chunks : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `[ESBuild-Builder]: Bundle failed\nError: ${error.message}`,
        );
      } else {
        throw new Error(
          `[ESBuild-Builder]: Bundle failed\nError: ${JSON.stringify(error)}`,
        );
      }
    } finally {
      esbuild.stop();
    }
  }
}

export { Builder };
