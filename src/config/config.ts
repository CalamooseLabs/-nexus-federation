// @ts-self-types="./config.d.ts"

import { parse } from "@std/jsonc";

import { defaultConfig } from "./config.default.ts";

/**
 * The Config class is responsible for loading the configuration for the application.
 * It will load the configuration from the config file, and then use that to set the configuration for the application.
 * It will also be responsible for providing the manifest to the server.
 */
class Config {
  version: Config.App["version"];
  remoteMap: Config.App["remoteMap"];
  basePath: Config.App["basePath"];
  skipConsumer: Config.App["skipConsumer"];
  skipProvider: Config.App["skipProvider"];
  cacheTime: Config.App["cacheTime"];
  hostname: Config.App["hostname"];
  port: Config.App["port"];
  imports: Config.App["imports"];
  importMap: Config.App["importMap"];
  compilerOptions: Config.App["compilerOptions"];
  configLocation: Config.App["configLocation"];
  federation: Config.App["federation"];
  plugins: Config.App["plugins"];

  constructor(config?: Config.App) {
    this.configLocation = config?.configLocation ??
      defaultConfig.configLocation;

    let denoConfig: DenoJSON.Config | null = null;
    // Read config file
    try {
      const parsedConfig = parse(Deno.readTextFileSync(this.configLocation!));
      denoConfig = parsedConfig as DenoJSON.Config;
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
    this.configLocation = config?.configLocation ??
      defaultConfig.configLocation;
    this.federation = config?.federation ?? defaultConfig.federation;
    this.plugins = config?.plugins ?? defaultConfig.plugins;
  }
}

export { Config };
