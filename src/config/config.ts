import { parse } from "@std/jsonc";

import { defaultConfig } from "./config.default.ts";

class Config {
  version: DefaultHerdConfig["version"];
  remoteMap: DefaultHerdConfig["remoteMap"];
  basePath: DefaultHerdConfig["basePath"];
  skipConsumer: DefaultHerdConfig["skipConsumer"];
  skipProvider: DefaultHerdConfig["skipProvider"];
  cacheTime: DefaultHerdConfig["cacheTime"];
  hostname: DefaultHerdConfig["hostname"];
  port: DefaultHerdConfig["port"];
  imports: DefaultHerdConfig["imports"];
  importMap: DefaultHerdConfig["importMap"];
  compilerOptions: DefaultHerdConfig["compilerOptions"];
  configLocation: DefaultHerdConfig["configLocation"];
  herd: DefaultHerdConfig["herd"];
  plugins: DefaultHerdConfig["plugins"];

  constructor(config?: HerdConfig) {
    this.configLocation = config?.configLocation ??
      defaultConfig.configLocation;

    let denoConfig: DenoConfig = null;
    // Read config file
    try {
      const parsedConfig = parse(Deno.readTextFileSync(this.configLocation));
      // Ensure parsedConfig is an object before assigning
      denoConfig = (typeof parsedConfig === "object" && parsedConfig !== null)
        ? parsedConfig as DenoJsonConfig
        : null;
    } catch {
      // Config file not found, using defaults
      denoConfig = {
        version: "1.0.0",
      };
    }

    this.version = config?.version ?? (denoConfig?.version as SemVer) ??
      defaultConfig.version;
    this.remoteMap = config?.remoteMap ?? defaultConfig.remoteMap;
    this.basePath = config?.basePath ?? defaultConfig.basePath;
    this.skipConsumer = config?.skipConsumer ?? defaultConfig.skipConsumer;
    this.skipProvider = config?.skipProvider ?? defaultConfig.skipProvider;
    this.cacheTime = config?.cacheTime ?? defaultConfig.cacheTime;
    this.hostname = config?.hostname ?? defaultConfig.hostname;
    this.port = config?.port ?? defaultConfig.port;
    this.imports = config?.imports ?? defaultConfig.imports;
    this.importMap = config?.importMap ?? defaultConfig.importMap;
    this.compilerOptions = config?.compilerOptions ??
      defaultConfig.compilerOptions;
    defaultConfig.configLocation;
    this.herd = config?.herd ?? defaultConfig.herd;
    this.plugins = config?.plugins ?? defaultConfig.plugins;
  }
}

export { Config };
