// @ts-self-types="./handler.d.ts"

import { walk } from "@std/fs";

class Handler {
  #basePath: string;
  #dirURL: URL;
  #dirPath: string;
  #routes!: Routes;

  constructor(dirURL: URL, basePath: string = "/_federation") {
    this.#basePath = basePath;
    this.#dirURL = dirURL;
    this.#dirPath = dirURL.pathname;

    this.#setupRoutes();
  }

  /**
   * Sets up routes by scanning the routes directory and importing handlers.
   * @private
   * @returns {Promise<void>}
   */
  async #setupRoutes(): Promise<void> {
    this.#routes = {};

    const entries = await walk(this.#dirURL, {
      includeDirs: false,
      includeFiles: true,
      exts: [".ts"],
    });
    // Get all .ts files from the directory
    try {
      for await (const entry of entries) {
        // Remove the base path from the entry path
        const path = entry.path.replace(this.#dirPath, "");

        // Generate the route path by combining basePath with filename (minus .ts)
        let routePath = `${this.#basePath}${path.replace(".ts", "")}`;

        // Change any variable path of [variableName] to :variableName
        routePath = routePath.replace(/\[(\w+)\]/g, ":$1");

        // Import the module dynamically
        const module = await import(entry.path);

        this.#routes[routePath] = {};

        // Check for HTTP method exports (get, post, etc.)
        const methods: HTTPMethod[] = ["GET", "POST", "PUT", "DELETE"];
        for (const method of methods) {
          if (module[method]) {
            this.#routes[routePath][method] = module[method];
          }
        }
      }
    } catch (error) {
      console.error(`Error reading routes directory: ${error}`);
      throw error;
    }
  }

  /**
   * Matches a request against registered routes to find the appropriate handler.
   * @public
   * @param {Context | MinRequest} reqOrCtx - Request or context object
   * @returns {string | undefined} Matched route path or undefined if no match
   * @throws {Error} When URL is blank
   */
  matchRoute(reqOrCtx: Context | MinRequest): string | undefined {
    // Get URL from context or request
    const url: string | URL | undefined =
      ("req" in reqOrCtx ? reqOrCtx.req?.url : undefined) ??
        ("request" in reqOrCtx ? reqOrCtx.request?.url : undefined) ??
        ("url" in reqOrCtx ? reqOrCtx.url : undefined);
    if (!url) return undefined;

    let pathname: string;
    try {
      pathname = new URL(url).pathname;
    } catch (_e) {
      if (!url) {
        throw new Error("Federation Error: URL is blank");
      }
      pathname = url.toString();
    }

    const method: string | undefined =
      ("req" in reqOrCtx ? reqOrCtx.req?.method : undefined) ??
        ("request" in reqOrCtx ? reqOrCtx.request?.method : undefined) ??
        ("method" in reqOrCtx ? reqOrCtx.method : undefined);
    if (!method) return undefined;

    // Check if route exists with potential variables
    for (const registeredPath of Object.keys(this.#routes)) {
      const pathParts = pathname.split("/").filter(Boolean);
      const routeParts = registeredPath.split("/").filter(Boolean);

      if (pathParts.length === routeParts.length) {
        let matches = true;
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(":")) {
            continue;
          } else if (routeParts[i] === pathParts[i]) {
            continue;
          }
          matches = false;
          break;
        }
        if (matches && this.#routes[registeredPath][method as HTTPMethod]) {
          return registeredPath;
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the route handler functions for a given path.
   * @public
   * @param {string} path - The route path
   * @returns {Record<HTTPMethod, RouteHandler> | undefined} The route handler functions if found
   */
  public getRouteFn(path: string): RouteHandler | undefined {
    const route = this.#routes[path];
    if (!route) return undefined;
    return route as RouteHandler;
  }

  /**
   * Extracts path parameters from a URL based on a pattern.
   * @public
   * @template T - The path pattern type
   * @param {T} pattern - The route pattern with parameter placeholders
   * @param {string | URL} url - The URL to extract parameters from
   * @returns {ExtractPathParams<T>} Object containing extracted path parameters
   * @throws {Error} When URL is blank
   */
  public getPathParams<T extends string>(
    pattern: T,
    url: string | URL,
  ): ExtractPathParams<T> {
    let uri: URL;
    let pathname: string;
    try {
      uri = url instanceof URL ? url : new URL(url);
      pathname = uri.pathname;
    } catch (_e) {
      if (typeof url === "string" && url.trim() !== "") {
        pathname = url;
      } else {
        throw new Error("Federation Error: URL is blank");
      }
    }

    const patternSegments = pattern.split("/").filter(Boolean);
    const pathSegments = pathname.split("/").filter(Boolean);

    const params: Record<string, string> = {};

    patternSegments.forEach((segment, index) => {
      if (segment.startsWith(":")) {
        const paramName = segment.slice(1);
        const paramValue = pathSegments[index];
        if (paramValue) {
          params[paramName] = paramValue;
        }
      }
    });

    return params as ExtractPathParams<T>;
  }
}

export { Handler };
