// @ts-self-types="./handler.d.ts"

import { walkSync } from "@std/fs";

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
  #setupRoutes(): void {
    this.#routes = {};

    for (
      const entry of walkSync(this.#dirURL, {
        includeDirs: false,
        includeFiles: true,
        exts: [".ts"],
      })
    ) {
      const path = entry.path.replace(this.#dirPath, "");
      let routePath = `${this.#basePath}${path.replace(".ts", "")}`;
      routePath = routePath.replace(/\[(\w+)\]/g, ":$1");

      this.#routes[routePath] = entry.path as RoutePath; // Store the path instead of importing
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
        if (matches && this.#routes[registeredPath]) {
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
  public async getRouteFn(
    path: string,
    method: HTTPMethod,
  ): Promise<RouteHandlerFn | undefined> {
    const routePath = this.#routes[path];
    if (!routePath) return undefined;

    const module = await import(routePath); // Import the module dynamically
    return module[method] as RouteHandlerFn | undefined;
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
