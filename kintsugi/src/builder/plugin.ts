// @ts-self-types="./plugin.d.ts"

export class BuilderPlugin {
  constructor(_options: KintsugiBuilderPlugin.Options) {}

  beforeBuild(entryPoint: string): Promise<string> {
    return new Promise((resolve) => resolve(entryPoint));
  }

  afterBuild(
    buildResult: KintsugiBuilder.BundleResult,
  ): Promise<KintsugiBuilder.BundleResult> {
    return new Promise((resolve) => resolve(buildResult));
  }

  applyBeforeBuild(entryPoint: string): Promise<string> {
    return new Promise((resolve) => resolve(entryPoint));
  }

  applyAfterBuild(
    buildResult: KintsugiBuilder.BundleResult,
  ): Promise<KintsugiBuilder.BundleResult> {
    return new Promise((resolve) => resolve(buildResult));
  }
}
