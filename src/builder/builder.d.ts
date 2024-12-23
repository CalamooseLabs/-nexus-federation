declare namespace Builder {
  type ImportKind =
    | "entry-point"
    // JS
    | "import-statement"
    | "require-call"
    | "dynamic-import"
    | "require-resolve"
    // CSS
    | "import-rule"
    | "composes-from"
    | "url-token";
  interface Metafile {
    inputs: {
      [path: string]: {
        bytes: number;
        imports: {
          path: string;
          kind: ImportKind;
          external?: boolean;
          original?: string;
          with?: Record<string, string>;
        }[];
        format?: "cjs" | "esm";
        with?: Record<string, string>;
      };
    };
    outputs: {
      [path: string]: {
        bytes: number;
        inputs: {
          [path: string]: {
            bytesInOutput: number;
          };
        };
        imports: {
          path: string;
          kind: ImportKind | "file-loader";
          external?: boolean;
        }[];
        exports: string[];
        entryPoint?: string;
        cssBundle?: string;
      };
    };
  }

  interface WarningLocation {
    file: string;
    namespace: string;
    /** 1-based */
    line: number;
    /** 0-based, in bytes */
    column: number;
    /** in bytes */
    length: number;
    lineText: string;
    suggestion: string;
  }

  interface WarningMessage {
    id: string;
    pluginName: string;
    text: string;
    location: WarningLocation | null;
    notes: {
      text: string;
      location: WarningLocation | null;
    }[];
  }

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
    outdir?: string;
    externals?: string[];
  }

  interface BundleResult {
    code: string;
    map?: string;
    warnings: WarningMessage[];
    importURL: string;
    chunks?: Record<string, {
      code: string;
      importURL: string;
    }>;
    metafile?: Metafile;
  }
}
