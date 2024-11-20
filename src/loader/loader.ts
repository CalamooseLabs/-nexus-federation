// @ts-self-types="./loader.d.ts"

interface AliasMapKey {
  "baseUrl": string | URL;
  "componentPath": string;
}

class Loader {
  // #islandRegistry: Map<ComponentType, Island>;
  #aliasMap: Map<string, AliasMapKey>;

  constructor() {
    // this.#islandRegistry = new Map();
    this.#aliasMap = new Map();
  }

  public addIsland(
    alias: string,
    baseUrl: AliasMapKey["baseUrl"],
    componentPath: AliasMapKey["componentPath"],
  ) {
    this.#aliasMap.set(alias, {
      baseUrl,
      componentPath,
    });
  }

  static IS_BROWSER(): boolean {
    return typeof window !== "undefined";
  }

  // public async loadIsland(alias: string): Promise<() => unknown> {
  //   const ServerIsland = await import(alias);

  //   const Loading = () => h("div", {}, "Loading...");

  //   return () => {
  //     if (!IS_BROWSER) {
  //       return h(Fragment, {}, ServerIsland.default());
  //     }
  //     const ClientIsland = lazy(() => import(alias));

  //     return h(
  //       Fragment,
  //       {},
  //       h(
  //         Suspense,
  //         { fallback: h(Loading, {}) },
  //         h(ClientIsland, { message: "Hello from Lazy Component!" }),
  //       ),
  //     );
  //   };
  // }
}

export { Loader };
