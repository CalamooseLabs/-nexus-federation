// @ts-self-types="./plugin.d.ts"

import { BuilderPlugin } from "#kintsugi";
import { defaultBaseCSS, defaultTailwindConfig } from "./config.default.ts";

import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

class TailwindCSSPlugin extends BuilderPlugin {
  #tailwindConfig: Tailwind.Config;
  #baseCSS: string;

  constructor(config?: Tailwind.Config, baseCSS?: string) {
    super({
      name: "TailwindCSSPlugin",
    });

    this.#baseCSS = baseCSS ?? defaultBaseCSS;
    this.#tailwindConfig = config ?? defaultTailwindConfig;
  }

  override async beforeBuild(entryPoint: string): Promise<string> {
    const result = await this.#processCSS([entryPoint]);
    return result;
  }

  async #processCSS(
    content: Tailwind.Content,
    tailwindConfig: Tailwind.ProcessConfig = this.#tailwindConfig,
    baseCSS: string = this.#baseCSS,
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
        throw new Error(`[TailwindCSSPlugin] PostCSS failed: ${error.message}`);
      } else {
        throw new Error(
          `[TailwindCSSPlugin] PostCSS failed: ${JSON.stringify(error)}`,
        );
      }
    }
  }
}

export { TailwindCSSPlugin };
