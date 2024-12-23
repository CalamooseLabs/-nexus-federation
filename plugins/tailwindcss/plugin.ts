// @ts-self-types="./plugin.d.ts"

import { BuilderPlugin } from "#kintsugi";
import { defaultBaseCSS, defaultTailwindConfig } from "./config.default.ts";

import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

class TailwindCSSPlugin extends BuilderPlugin {
  #tailwindConfig: TailwindConfig;

  constructor(config?: TailwindConfig) {
    super({
      name: "TailwindCSS",
    });

    this.#tailwindConfig = config ?? defaultTailwindConfig;
  }

  override afterBuild() {
  }

  async #processCSS(
    content: TailwindContent,
    tailwindConfig: TailwindProcessConfig = defaultTailwindConfig,
    baseCSS: string = defaultBaseCSS,
  ): Promise<string> {
    try {
      // Initialize PostCSS with Tailwind and other plugins
      const processor = postcss([
        tailwindcss({
          ...tailwindConfig,
          content,
        }),
        autoprefixer,
        cssnano({
          preset: ["default", {
            discardComments: {
              removeAll: true,
            },
          }],
        }),
      ]);

      // Process the CSS content
      const result = await processor.process(baseCSS, {
        from: undefined, // Tells PostCSS that this CSS is not from a file
      });

      return result.css;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`PostCSS failed: ${error.message}`);
      } else {
        throw new Error(`PostCSS failed: ${JSON.stringify(error)}`);
      }
    }
  }
}

export { TailwindCSSPlugin };
