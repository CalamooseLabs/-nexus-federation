import { Builder } from "@calamooselabs/kintsugi/builder";
import postcss from "postcss";

declare namespace PostCSSBuilder {
  interface Options {
    plugins?: (content: string) => postcss.AcceptedPlugin[];
    baseCSSOverride?: string;
  }
}

export class PostCSSBuilder extends Builder {
  #plugins: PostCSSBuilder.Options["plugins"];
  #baseCSS: PostCSSBuilder.Options["baseCSSOverride"];

  constructor(options: PostCSSBuilder.Options = {}) {
    super();

    this.#plugins = options.plugins;
    this.#baseCSS = options.baseCSSOverride ?? undefined;
  }

  override async bundle(
    options: KintsugiBuilder.BundleOptions,
  ): Promise<KintsugiBuilder.BundleResult> {
    try {
      const plugins: postcss.AcceptedPlugin[] = this.#plugins
        ? this.#plugins!(options.entryPoint)
        : [];

      const processor = postcss(plugins);

      // Process the CSS content
      const result = await processor.process(
        this.#baseCSS ?? options.entryPoint,
        {
          from: undefined, // Tells PostCSS that this CSS is not from a file
        },
      );

      return {
        code: result.css,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `[PostCSSBuilder] PostCSS failed!\nError: ${error.message}`,
        );
      } else {
        throw new Error(
          `[PostCSSBuilder] PostCSS failed!\nError: ${JSON.stringify(error)}`,
        );
      }
    }
  }
}
