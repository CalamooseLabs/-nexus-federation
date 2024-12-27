// @ts-self-types="./builder.d.ts"

/**
 * The Builder class is responsible for building the modules from the source code.
 * It will take in the source code and return code that can be understood by the requested environment, whether that be Deno or a browser.
 * Builder will take an import map and use that to resolve the imports, this will allow for the use of aliases in the source code.
 *
 * What this needs to do will be determined by the loader class. As loader needs to be able to specify what should be loaded and builder will decide how to bundle.
 */
export class Builder {
  constructor() {}

  //  deno-lint-ignore require-await
  public async bundle(
    _options: KintsugiBuilder.BundleOptions,
  ): Promise<KintsugiBuilder.BundleResult> {
    return new Promise((resolve) => {
      resolve({
        code: "",
        map: "",
        warnings: [],
        importURL: "",
        chunks: {},
      });
    });
  }
}
