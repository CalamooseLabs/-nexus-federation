interface AppConfig {
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
  federation?: {
    nexus?: string | string[];
    autoDiscovery?: boolean;
    apiKey?: string;
    name?: string;
  };
  plugins?: PluginFn[];
}

type DefaultAppConfig = NonOptional<AppConfig>;

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
