interface HerdConfig {
  remoteMap: {
    [remoteBaseURL: string]: {
      [alias: string]: string;
    };
  };
  version: SemVer;
  basePath: "/" | `/${string}`;
  skipConsumer?: boolean;
  skipProvider?: boolean;
  cacheTime?: number;
  hostname?: string;
  port?: number;
  imports?: string[];
  importMap?: Record<string, string>;
  compilerOptions?: Record<string, string>;
  configLocation?: string;
  herd?: {
    leader?: string;
    autoDiscovery?: boolean;
    apiKey?: string;
    name?: string;
    coLeaders?: string[];
  };
  plugins?: PluginFn[];
}

type DefaultHerdConfig = NonOptional<HerdConfig>;

type JsonType =
  | { [key: string]: JsonType | undefined }
  | JsonType[]
  | string
  | number
  | boolean
  | null;

interface DenoJsonConfig {
  [key: string]: JsonType | undefined;
  version?: SemVer;
}

type DenoConfig = DenoJsonConfig | null;
