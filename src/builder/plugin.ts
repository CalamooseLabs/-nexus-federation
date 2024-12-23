// @ts-self-types="./plugin.d.ts"

class BuilderPlugin {
  constructor(_options: BuilderPlugin.Options) {}

  beforeBuild(entryPoint: string): Promise<string> {
    return new Promise((resolve) => resolve(entryPoint));
  }

  afterBuild(buildResult: Builder.BundleResult): Promise<Builder.BundleResult> {
    return new Promise((resolve) => resolve(buildResult));
  }

  applyBeforeBuild(entryPoint: string): Promise<string> {
    return new Promise((resolve) => resolve(entryPoint));
  }

  applyAfterBuild(
    buildResult: Builder.BundleResult,
  ): Promise<Builder.BundleResult> {
    return new Promise((resolve) => resolve(buildResult));
  }
}

export default BuilderPlugin;
export { BuilderPlugin };
