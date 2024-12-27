declare namespace KintsugiBuilder {
  interface BundleOptions {
    entryPoint: string;
    target: "browser" | "deno";
    minify?: boolean;
    sourcemap?: boolean;
    importMap?: {
      imports: Record<string, string>;
    };
    compilerOptions?: {
      jsx?: "transform" | "preserve" | "automatic";
      jsxFactory?: string;
      jsxFragment?: string;
      jsxImportSource?: string;
    };
    splitting?: boolean;
    externals?: string[];
  }

  interface BundleResult {
    code: string;
    chunks?: Record<string, {
      code: string;
      importURL: string;
    }>;
  }
}
