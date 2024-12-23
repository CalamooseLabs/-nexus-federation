declare namespace Tailwind {
  type FilePath = string;
  type RawFile = { raw: string; extension?: string };

  type Expand<T> = T extends object
    ? T extends infer O ? { [K in keyof O]: Expand<O[K]> }
    : never
    : T;

  type FutureConfigValues =
    | "hoverOnlyWhenSupported"
    | "respectDefaultRingColorOpacity"
    | "disableColorOpacityUtilitiesByDefault"
    | "relativeContentPathsByDefault";

  type FutureConfig =
    | Expand<"all" | Partial<Record<FutureConfigValues, boolean>>>
    | [];

  type ExperimentalConfigValues =
    | "optimizeUniversalDefaults"
    | "matchVariant";
  type ExperimentalConfig =
    | Expand<
      "all" | Partial<Record<ExperimentalConfigValues, boolean>>
    >
    | [];

  type DarkModeConfig =
    | "media"
    | "class"
    | ["class", string]
    | "selector"
    | ["selector", string]
    | ["variant", string | string[]];

  type ExtractorFN = (content: string) => string[];
  type TransformerFN = (content: string) => string;

  type ContentConfig = (
    RawFile | FilePath | string
  )[] | {
    files: (FilePath | RawFile)[];
    relative?: boolean;
    extract?: ExtractorFN | { [extension: string]: ExtractorFN };
    transform?: TransformerFN | {
      [extension: string]: TransformerFN;
    };
  };

  interface OptionalConfig {
    important: Partial<string | boolean>;
    prefix: Partial<string>;
    separator: Partial<string>;
    safelist: Array<
      string | {
        pattern: RegExp;
        variants?: string[];
      }
    >;
    blocklist: Array<string>;
    presets: Array<Partial<Config>>;
    future: Partial<FutureConfig>;
    experimental: Partial<ExperimentalConfig>;
    darkMode: Partial<DarkModeConfig>;
    // deno-lint-ignore no-explicit-any
    theme: Partial<any & { extend: Partial<any> }>;
    // deno-lint-ignore no-explicit-any
    corePlugins: Partial<any>;
    // deno-lint-ignore no-explicit-any
    plugins: Partial<any>;
    // deno-lint-ignore no-explicit-any
    [key: string]: any;
  }

  interface RequiredConfig {
    content: ContentConfig;
  }

  type Config = RequiredConfig & Partial<OptionalConfig>;

  type Content = Config["content"];
  type ProcessConfig = Omit<Config, "content">;
}
