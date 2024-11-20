// @ts-self-types="./loader.d.ts"

interface AliasMapKey {
  "baseUrl": string | URL;
  "componentPath": string;
}

class Loader {
  #aliasMap: Map<string, AliasMapKey>;

  constructor() {
    // this.#islandRegistry = new Map();
    this.#aliasMap = new Map();
  }
}

export { Loader };
