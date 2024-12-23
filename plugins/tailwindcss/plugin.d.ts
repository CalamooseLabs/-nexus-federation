type TailwindFilePath = string;
type TailwindRawFile = { raw: string; extension?: string };

type TailwindExpand<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: TailwindExpand<O[K]> }
  : never
  : T;

type TailwindFutureConfigValues =
  | "hoverOnlyWhenSupported"
  | "respectDefaultRingColorOpacity"
  | "disableColorOpacityUtilitiesByDefault"
  | "relativeContentPathsByDefault";

type TailwindFutureConfig =
  | TailwindExpand<"all" | Partial<Record<TailwindFutureConfigValues, boolean>>>
  | [];

type TailwindExperimentalConfigValues =
  | "optimizeUniversalDefaults"
  | "matchVariant";
type TailwindExperimentalConfig =
  | TailwindExpand<
    "all" | Partial<Record<TailwindExperimentalConfigValues, boolean>>
  >
  | [];

type TailwindDarkModeConfig =
  // Use the `media` query strategy.
  | "media"
  // Use the `class` strategy, which requires a `.dark` class on the `html`.
  | "class"
  // Use the `class` strategy with a custom class instead of `.dark`.
  | ["class", string]
  // Use the `selector` strategy — same as `class` but uses `:where()` for more predicable behavior
  | "selector"
  // Use the `selector` strategy with a custom selector instead of `.dark`.
  | ["selector", string]
  // Use the `variant` strategy, which allows you to completely customize the selector
  // It takes a string or an array of strings, which are passed directly to `addVariant()`
  | ["variant", string | string[]];

type ExtractorTailwindFN = (content: string) => string[];
type TransformerTailwindFN = (content: string) => string;

type TailwindContentConfig = (
  TailwindRawFile | TailwindFilePath | string
)[] | {
  files: (TailwindFilePath | TailwindRawFile)[];
  relative?: boolean;
  extract?: ExtractorTailwindFN | { [extension: string]: ExtractorTailwindFN };
  transform?: TransformerTailwindFN | {
    [extension: string]: TransformerTailwindFN;
  };
};

interface TailwindOptionalConfig {
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
  presets: Array<Partial<TailwindConfig>>;
  future: Partial<TailwindFutureConfig>;
  experimental: Partial<TailwindExperimentalConfig>;
  darkMode: Partial<TailwindDarkModeConfig>;
  // deno-lint-ignore no-explicit-any
  theme: Partial<any & { extend: Partial<any> }>;
  // deno-lint-ignore no-explicit-any
  corePlugins: Partial<any>;
  // deno-lint-ignore no-explicit-any
  plugins: Partial<any>;
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}

interface RequiredTailwindConfig {
  content: TailwindContentConfig;
}

type TailwindConfig = RequiredTailwindConfig & Partial<TailwindOptionalConfig>;

type TailwindContent = TailwindConfig["content"];
type TailwindProcessConfig = Omit<TailwindConfig, "content">;
