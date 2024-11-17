import { Loader } from "#loader";
import { Handler } from "#handler";
import { Config } from "#config";
import { Builder } from "#builder";

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
  #builder: Builder;
  #config: Config;
  #handler: Handler;
  #instance_id: UUID;

  /**
   * Creates a new App instance with optional configuration.
   * @param {HerdConfig} [config] - Optional configuration object
   */
  constructor(config?: HerdConfig) {
    this.#instance_id = crypto.randomUUID();

    this.#builder = new Builder();
    this.#config = new Config(config);
    this.#handler = new Handler("./routes", this.#config.basePath);

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
    AppContext.params = this.#handler.getPathParams(pathname, req.url ?? "");

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

    const matchedRoute = this.#handler.matchRoute(reqOrCtx);

    if (matchedRoute !== undefined) {
      ctx = this.#normalizeContext(matchedRoute, reqOrCtx, resOrNext, next);

      // Get the route handler function for the matched route and method
      const routeHandler = this.#handler.getRouteFn(matchedRoute);
      if (routeHandler) {
        const handler = routeHandler[ctx.method];
        if (handler) {
          return handler(ctx);
        }
      }

      return await ctx.next();
    }

    return;
  }

  /**
   * Gets the unique instance ID of this App instance.
   * @returns {UUID} The instance UUID
   */
  get id(): UUID {
    return this.#instance_id;
  }
}

export { App };
