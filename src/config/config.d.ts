declare namespace Config {
  interface App {
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
    plugins?: Kintsugi.PluginFn[];
  }

  type DefaultAppConfig = NonOptional<Config.App>;

  type JsonType =
    | { [key: string]: JsonType | undefined }
    | JsonType[]
    | string
    | number
    | boolean
    | null;
}
