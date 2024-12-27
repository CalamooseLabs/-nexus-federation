import { PostCSSBuilder } from "@calamooselabs/builder-postcss";

import { defaultBaseCSS, defaultTailwindConfig } from "./config.default.ts";

import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

class TailwindCSSPlugin extends PostCSSBuilder {
  constructor(config?: tailwindcss.Config, baseCSS?: string) {
    super({
      plugins: (content) => {
        const tailwindConfig = config ?? defaultTailwindConfig;
        const tailwindContent = content
          ? [content]
          : tailwindConfig.content ?? [];
        return [
          tailwindcss({
            ...tailwindConfig,
            content: tailwindContent,
          }),
          autoprefixer,
          cssnano({
            preset: ["default", {
              discardComments: {
                removeAll: true,
              },
            }],
          }),
        ];
      },
      baseCSSOverride: baseCSS ?? defaultBaseCSS,
    });
  }
}

export { TailwindCSSPlugin };
