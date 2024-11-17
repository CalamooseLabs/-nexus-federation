import { walk } from "@std/fs";
import { v1 as uuidv1 } from "@std/uuid";

import Loader from "../loader/loader.ts";
import DefaultConfig from "./config.default.ts";

/**
 * App class handles routing and middleware functionality for the federation framework.
 * It manages route matching, context normalization, and request handling.
 */
class App {
  // Static properties
  static #loader: Loader;
  static #instances: Record<string, App> = {};

  middleware = this.#middleware;

  // Private instance properties
  #config: Config;
  #instance_id: UUID;
  #routes!: Routes;

  /**
   * Creates a new App instance with optional configuration.
   * @param {Config} [config] - Optional configuration object
   */
  constructor(config?: Config) {
    this.#instance_id = uuidv1.generate() as UUID;
    this.#config = config ?? DefaultConfig;

    this.#setupRoutes();
    this.middleware = this.#middleware.bind(this);

    App.#instances[this.#instance_id] = this;
    App.#initializeLoader();
  }

  /**
   * Initializes the static loader if it hasn't been initialized yet.
   * @private
   */
  static #initializeLoader() {
    if (!App.#loader) {
      this.#loader = new Loader();
    }
  }

  /**
   * Extracts path parameters from a URL based on a pattern.
   * @private
   * @template T - The path pattern type
   * @param {T} pattern - The route pattern with parameter placeholders
   * @param {string | URL} url - The URL to extract parameters from
   * @returns {ExtractPathParams<T>} Object containing extracted path parameters
   * @throws {Error} When URL is blank
   */
  #getPathParams<T extends string>(
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

  /**
   * Normalizes different context/request/response combinations into a standard AppContext.
   * @private
   * @param {string} pathname - The route pathname
   * @param {Context | MinRequest} reqOrCtx - Request or context object
   * @param {MinResponse | MiddlewareNext} [resOrNext] - Response or next middleware function
   * @param {MiddlewareNext} [next] - Next middleware function
   * @returns {AppContext} Normalized context object
   * @throws {Error} When request is missing from context
   */
  #normalizeContext(
    pathname: string,
    reqOrCtx: Context | MinRequest,
    resOrNext?: MinResponse | MiddlewareNext,
    next?: MiddlewareNext,
  ): AppContext {
    const AppContext: AppContext = {} as AppContext;

    let ctx: Context;
    let req: MinRequest | undefined;
    let resp: MinResponse | undefined;
    let nextFn: MiddlewareNext | undefined;

    if (next) {
      // Then all params are provided meaning resOrNext is a response and reqOrCtx is a request
      const n: MiddlewareNext = next as MiddlewareNext;
      const r: MinResponse = resOrNext as MinResponse;
      const rq: MinRequest = reqOrCtx as MinRequest;

      nextFn = n;
      resp = r;
      req = rq;
      ctx = {};
    } else if (resOrNext) {
      // Then next is provided meaning reqOrCtx is a context and resOrNext is a next function
      const c: Context = reqOrCtx as Context;
      const n: MiddlewareNext = resOrNext as MiddlewareNext;

      nextFn = n;
      resp = c.response ?? c.resp;
      req = c.req ?? c.request;
      ctx = c;
    } else {
      // Then only reqOrCtx is provided meaning it is a context
      const c: Context = reqOrCtx as Context;

      req = c.req ?? c.request;
      resp = c.resp ?? c.response;
      nextFn = c.next;
      ctx = c;
    }

    if (!req) {
      throw new Error("Request is required in context");
    }

    AppContext.req = req;
    AppContext.method = req.method as HTTPMethod;
    AppContext.next = nextFn ?? (() => {
      return new Promise((resolve) => {
        resolve(
          new Response(
            "Federation Error: Next function is required in middleware",
          ),
        );
      });
    });
    AppContext.params = this.#getPathParams(pathname, req.url ?? "");

    // If no response is provided, we need to create a new response type object with custom methods
    resp = resp ?? {
      body: "",
    };

    AppContext.resp = resp;
    Object.defineProperty(AppContext, "body", {
      get: () => ctx.body ?? resp.body,
      set: (value) => {
        if (!ctx.body) {
          resp.body = value;
        } else {
          ctx.body = value;
        }
      },
    });
    Object.defineProperty(AppContext, "status", {
      get: () => resp.status ?? 200,
      set: (value) => {
        resp.status = value;
      },
    });
    Object.defineProperty(AppContext, "headers", {
      get: () => resp.headers,
      set: (value) => {
        resp.headers = value;
      },
    });
    AppContext.send = () => {
      if (resp.send) resp.send(AppContext.body as string);
      return new Response(AppContext.body as string, {
        status: AppContext.status,
      });
    };

    return AppContext;
  }

  /**
   * Universal middleware handler that processes incoming requests and routes them to appropriate federation handlers.
   * @private
   * @overload
   * @param {Context} ctx - Context object containing request and response
   * @returns {Promise<Response>} Response object
   */
  async #middleware(ctx: Context): Promise<Response>;
  /**
   * @private
   * @overload
   * @param {Context} ctx - Context object containing request and response
   * @param {MiddlewareNext} next - Next middleware function
   * @returns {MiddlewareResponse} Promise resolving to void or Response
   */
  async #middleware(ctx: Context, next: MiddlewareNext): MiddlewareResponse;
  /**
   * @private
   * @overload
   * @param {Context} ctx - Context object containing request and response
   * @param {MiddlewareNext} next - Next middleware function
   * @returns {MiddlewareResponse} Promise resolving to void or Response
   */
  /**
   * @private
   * @overload
   * @param {MinRequest} req - Request object
   * @param {MinResponse} res - Response object
   * @param {MiddlewareNext} next - Next middleware function
   * @returns {MiddlewareResponse} Promise resolving to void or Response
   */
  async #middleware(
    req: MinRequest,
    res: MinResponse,
    next: MiddlewareNext,
  ): MiddlewareResponse;

  // The actual definition of the middleware function that needs to filter out the request/response/next params depending on the overload
  async #middleware(
    reqOrCtx: Context | MinRequest,
    resOrNext?: MinResponse | MiddlewareNext,
    next?: MiddlewareNext,
  ): Promise<void | Response> {
    let ctx: AppContext;

    const matchedRoute = this.#matchRoute(reqOrCtx);

    if (matchedRoute !== undefined) {
      ctx = this.#normalizeContext(matchedRoute, reqOrCtx, resOrNext, next);

      const handler = this.#routes[matchedRoute][ctx.method];
      if (handler) {
        return handler(ctx);
      }

      return await ctx.next();
    }

    return;
  }

  /**
   * Matches a request against registered routes to find the appropriate handler.
   * @private
   * @param {Context | MinRequest} reqOrCtx - Request or context object
   * @returns {string | undefined} Matched route path or undefined if no match
   * @throws {Error} When URL is blank
   */
  #matchRoute(reqOrCtx: Context | MinRequest): string | undefined {
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
          if (
            !routeParts[i].startsWith(":") && routeParts[i] !== pathParts[i]
          ) {
            matches = false;
            break;
          }
        }
        if (matches && this.#routes[registeredPath][method as HTTPMethod]) {
          return registeredPath;
        }
      }
    }
    return undefined;
  }

  /**
   * Sets up routes by scanning the routes directory and importing handlers.
   * @private
   * @param {string} [basePath="/_federation"] - Base path for all routes
   * @param {string} [dirPath="./routes"] - Directory containing route handlers
   * @returns {Promise<void>}
   */
  async #setupRoutes(
    basePath: string = "/_federation",
    dirPath: string = "./routes",
  ): Promise<void> {
    this.#routes = {};
    // Get all .ts files from the directory
    const files = await walk(new URL(dirPath, import.meta.url), {
      exts: [".ts"],
      includeDirs: false,
      includeSymlinks: false,
      includeFiles: true,
    });

    for await (const file of files) {
      // Generate the route path by combining basePath with filename (minus .ts)
      const routePath = `${basePath}/${file.name.replace(".ts", "")}`;

      // Import the module dynamically
      const module = await import(`${dirPath}/${file.name}`);

      this.#routes[routePath] = {};

      // Check for HTTP method exports (get, post, etc.)
      const methods: HTTPMethod[] = ["GET", "POST", "PUT", "DELETE"];
      for (const method of methods) {
        if (module[method]) {
          this.#routes[routePath][method] = module[method];
        }
      }
    }
  }

  /**
   * Loads an island component by alias.
   * @static
   * @param {string} alias - The alias of the island to load
   * @returns {string} The loaded island alias
   */
  public static loadIsland(alias: string) {
    return alias;
    // return App.#loader.loadIsland(alias);
  }

  /**
   * Gets the unique instance ID of this App instance.
   * @returns {UUID} The instance UUID
   */
  get id(): UUID {
    return this.#instance_id;
  }
}

const loadIsland = App.loadIsland;

export { loadIsland };
export default App;
