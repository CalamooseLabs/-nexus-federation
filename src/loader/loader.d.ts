declare class Loader {
  constructor();

  addIsland(alias: string, baseUrl: string, componentPath: string): void;
  loadIsland(alias: string): Promise<() => unknown>;
}
