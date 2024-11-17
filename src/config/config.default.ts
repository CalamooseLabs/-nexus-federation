const defaultConfig: DefaultHerdConfig = {
  version: "1.0.0",
  remoteMap: {},
  basePath: "/_federation",
  skipConsumer: false,
  skipProvider: false,
  cacheTime: 60000,
  hostname: "localhost",
  port: 8000,
  imports: [],
  importMap: {},
  compilerOptions: {},
  configLocation: "./deno.jsonc",
  herd: {
    leader: "",
    autoDiscovery: true,
    apiKey: "",
    name: "",
    coLeaders: [],
  },
  plugins: [],
};

export { defaultConfig };
