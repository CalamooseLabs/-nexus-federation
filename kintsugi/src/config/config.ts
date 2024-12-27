// @ts-self-types="./config.d.ts"

import { parse } from "@std/jsonc";

import { defaultConfig } from "./config.default.ts";

/**
 * The Config class is responsible for loading the configuration for the application.
 * It will load the configuration from the config file, and then use that to set the configuration for the application.
 * It will also be responsible for providing the manifest to the server.
 */
export class Config {
  version: KintsugiConfig.App["version"];
  remoteMap: KintsugiConfig.App["remoteMap"];
  basePath: KintsugiConfig.App["basePath"];
  skipConsumer: KintsugiConfig.App["skipConsumer"];
  skipProvider: KintsugiConfig.App["skipProvider"];
  cacheTime: KintsugiConfig.App["cacheTime"];
  hostname: KintsugiConfig.App["hostname"];
  port: KintsugiConfig.App["port"];
  imports: KintsugiConfig.App["imports"];
  importMap: KintsugiConfig.App["importMap"];
  compilerOptions: KintsugiConfig.App["compilerOptions"];
  configLocation: KintsugiConfig.App["configLocation"];
  federation: KintsugiConfig.App["federation"];
  plugins: KintsugiConfig.App["plugins"];

  constructor(config?: KintsugiConfig.App) {
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
