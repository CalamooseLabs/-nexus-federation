type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type NonOptional<T> = {
  [P in keyof T]-?: T[P];
};

type NumberPart = `${number}`;
type PreReleasePart = `-${string}`;
type BuildMetadataPart = `+${string}`;

type SemVer =
  | `${NumberPart}.${NumberPart}.${NumberPart}`
  | `${NumberPart}.${NumberPart}.${NumberPart}${PreReleasePart}`
  | `${NumberPart}.${NumberPart}.${NumberPart}${BuildMetadataPart}`
  | `${NumberPart}.${NumberPart}.${NumberPart}${PreReleasePart}${BuildMetadataPart}`;

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

type StandardHeaders =
  | "Accept"
  | "Accept-Charset"
  | "Accept-Encoding"
  | "Accept-Language"
  | "Authorization"
  | "Cache-Control"
  | "Connection"
  | "Content-Disposition"
  | "Content-Encoding"
  | "Content-Language"
  | "Content-Length"
  | "Content-Location"
  | "Content-Range"
  | "Content-Type"
  | "Cookie"
  | "Date"
  | "ETag"
  | "Expect"
  | "Expires"
  | "Forwarded"
  | "From"
  | "Host"
  | "If-Match"
  | "If-Modified-Since"
  | "If-None-Match"
  | "If-Range"
  | "If-Unmodified-Since"
  | "Last-Modified"
  | "Location"
  | "Origin"
  | "Pragma"
  | "Proxy-Authenticate"
  | "Range"
  | "Referer"
  | "Retry-After"
  | "Server"
  | "Set-Cookie"
  | "Strict-Transport-Security"
  | "TE"
  | "Trailer"
  | "Transfer-Encoding"
  | "Upgrade"
  | "User-Agent"
  | "Vary"
  | "Via"
  | "Warning"
  | "WWW-Authenticate"
  | "X-Content-Type-Options"
  | "X-DNS-Prefetch-Control"
  | "X-Forwarded-For"
  | "X-Forwarded-Host"
  | "X-Forwarded-Proto"
  | "X-Frame-Options"
  | "X-XSS-Protection";

type HeaderObject =
  & Partial<Record<StandardHeaders, string>>
  & Record<string, string>;

type UUID = `${string}-${string}-${string}-${string}-${string}`;

//  Deno's deno.json file version 2.1.4
declare namespace DenoJSON {
  type UnstableFeature =
    | "broadcast-channel"
    | "bare-node-builtins"
    | "byonm"
    | "cron"
    | "detect-cjs"
    | "ffi"
    | "fs"
    | "fmt-component"
    | "fmt-sql"
    | "http"
    | "kv"
    | "net"
    | "node-globals"
    | "sloppy-imports"
    | "temporal"
    | "unsafe-proto"
    | "webgpu"
    | "worker-options";

  type JSXOptions =
    | "preserve"
    | "react"
    | "react-jsx"
    | "react-jsxdev"
    | "react-native"
    | "precompile";

  type LintReportFormat = "pretty" | "json" | "compact";

  type ProseWrapOption = "always" | "never" | "preserve";

  type NodeModulesDirMode = "auto" | "manual" | "none";

  interface CompilerOptions {
    allowJs?: boolean;
    allowUnreachableCode?: boolean;
    allowUnusedLabels?: boolean;
    checkJs?: boolean;
    /** @deprecated */
    emitDecoratorMetadata?: boolean;
    exactOptionalPropertyTypes?: boolean;
    /** @deprecated */
    experimentalDecorators?: boolean;
    isolatedDeclarations?: boolean;
    jsx?: JSXOptions;
    jsxFactory?: string;
    jsxFragmentFactory?: string;
    jsxImportSource?: string;
    jsxImportSourceTypes?: string;
    jsxPrecompileSkipElements?: string[];
    lib?: string[];
    noErrorTruncation?: boolean;
    noFallthroughCasesInSwitch?: boolean;
    noImplicitAny?: boolean;
    noImplicitOverride?: boolean;
    noImplicitReturns?: boolean;
    noImplicitThis?: boolean;
    noPropertyAccessFromIndexSignature?: boolean;
    noUncheckedIndexedAccess?: boolean;
    noUnusedLocals?: boolean;
    noUnusedParameters?: boolean;
    strict?: boolean;
    strictBindCallApply?: boolean;
    strictBuiltinIteratorReturn?: boolean;
    strictFunctionTypes?: boolean;
    strictNullChecks?: boolean;
    strictPropertyInitialization?: boolean;
    types?: string[];
    useUnknownInCatchVariables?: boolean;
    verbatimModuleSyntax?: boolean;
  }

  interface FormatterOptions {
    useTabs?: boolean;
    lineWidth?: number;
    indentWidth?: number;
    singleQuote?: boolean;
    proseWrap?: ProseWrapOption;
    semiColons?: boolean;
  }

  interface LintRulesConfig {
    tags?: string[];
    exclude?: string[];
    include?: string[];
  }

  interface LintConfig {
    include?: string[];
    exclude?: string[];
    rules?: LintRulesConfig;
    report?: LintReportFormat;
  }

  interface FormatConfig {
    include?: string[];
    exclude?: string[];
    useTabs?: boolean;
    lineWidth?: number;
    indentWidth?: number;
    singleQuote?: boolean;
    proseWrap?: ProseWrapOption;
    semiColons?: boolean;
    options?: FormatterOptions;
  }

  interface TaskConfig {
    description?: string;
    command: string;
    dependencies?: string[];
  }

  type Tasks = {
    [key: string]: string | TaskConfig;
  };

  interface TestConfig {
    include?: string[];
    exclude?: string[];
  }

  interface PublishConfig {
    include?: string[];
    exclude?: string[];
  }

  interface BenchConfig {
    include?: string[];
    exclude?: string[];
  }

  interface LockConfig {
    path?: string;
    frozen?: boolean;
  }

  interface WorkspaceConfig {
    members?: string[];
  }

  interface Config {
    compilerOptions?: CompilerOptions;
    importMap?: string;
    imports?: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
    exclude?: string[];
    lint?: LintConfig;
    fmt?: FormatConfig;
    nodeModulesDir?: NodeModulesDirMode | boolean;
    vendor?: boolean;
    tasks?: Tasks;
    test?: TestConfig;
    publish?: PublishConfig;
    bench?: BenchConfig;
    license?: string;
    lock?: string | boolean | LockConfig;
    unstable?: UnstableFeature[];
    name?: string;
    version?: string;
    exports?: string | Record<string, string>;
    patch?: string[];
    workspace?: string[] | WorkspaceConfig;
  }
}
