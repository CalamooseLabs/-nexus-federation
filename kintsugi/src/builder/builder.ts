// @ts-self-types="./builder.d.ts"

/**
 * This Builder class is to be inherited by other builders. This will provide Kintsugi with the ability to bundle the code, independent of the bundler.
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
        chunks: undefined,
      });
    });
  }

  #getImportUrl(bundledCode: string): string {
    const importUrl = encodeURIComponent(bundledCode);
    return `data:application/javascript;charset=utf-8,${importUrl}`;
  }
}
