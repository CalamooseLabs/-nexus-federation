// @ts-self-types="./plugin.d.ts"

class BuilderPlugin {
  constructor(_options: BuilderPluginOptions) {}

  beforeBuild(entryPoint: string) {}

  afterBuild(buildResult: BundleResult) {}

  applyBeforeBuild(entryPoint: string) {}

  applyAfterBuild(buildResult: BundleResult) {}
}

export default BuilderPlugin;
export { BuilderPlugin };
