// @ts-self-types="./app.d.ts"

import { Loader } from "#loader";
import { Handler } from "#handler";
import { Config } from "#config";
import { Builder } from "#builder";

/**
 * App class handles routing and middleware functionality for the federation framework.
 * It manages route matching, context normalization, and request handling.
 */
export class App {
  // Static properties
  static #loader: Loader;
  static #instances: Record<string, App> = {};

  middleware: Kintsugi.MiddlewareFunction = this.#middleware;

  // Private instance properties
  #builder: Builder;
  #config: Config;
  #handler: Handler;
  #instance_id: UUID;

  /**
   * Creates a new App instance with optional configuration.
   * @param {KintsugiConfig.App} [config] - Optional configuration object
   */
  constructor(config?: KintsugiConfig.App) {
    this.#instance_id = crypto.randomUUID();

    this.#builder = new Builder();
    this.#config = new Config(config);
    this.#handler = new Handler(
      new URL("./routes", import.meta.url),
      this.#config.basePath,
    );

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
   * @param {Kintsugi.NormalizeContextParams["pathname"]} pathname - The route pathname
   * @param {Kintsugi.NormalizeContextParams["reqOrCtx"]} reqOrCtx - Request or context object
   * @param {Kintsugi.NormalizeContextParams["resOrNextOrHandlerInfo"]} [resOrNextOrHandlerInfo] - Response or next middleware function
   * @param {Kintsugi.NormalizeContextParams["next"]} [next] - Next middleware function
   * @returns {Kintsugi.AppContext} Normalized context object
   * @throws {Error} When request is missing from context
   */
  #normalizeContext(
    pathname: Kintsugi.NormalizeContextParams["pathname"],
    reqOrCtx: Kintsugi.NormalizeContextParams["reqOrCtx"],
    resOrNextOrHandlerInfo?:
      Kintsugi.NormalizeContextParams["resOrNextOrHandlerInfo"],
    next?: Kintsugi.NormalizeContextParams["next"],
  ): Kintsugi.AppContext {
    const AppContext: Kintsugi.AppContext = {} as Kintsugi.AppContext;

    let ctx: Kintsugi.Context;
    let req: Kintsugi.MinRequest;
    let resp: Kintsugi.MinResponse | undefined;
    let nextFn: Kintsugi.MiddlewareNext | undefined;

    if (next) {
      // Then all params are provided meaning resOrNext is a response and reqOrCtx is a request
      // Three param overload
      const n: Kintsugi.MiddlewareNext = next as Kintsugi.MiddlewareNext;
      const r: Kintsugi.MinResponse =
        resOrNextOrHandlerInfo as Kintsugi.MinResponse;
      const rq: Kintsugi.MinRequest = reqOrCtx as Kintsugi.MinRequest;

      nextFn = n;
      resp = r;
      req = rq;
      ctx = {};
    } else if (resOrNextOrHandlerInfo) {
      // Then next is provided meaning reqOrCtx is a context and resOrNext is a next function
      // Two param overload
      if (resOrNextOrHandlerInfo instanceof Function) {
        // Then it is a context and next is provided
        const c: Kintsugi.Context = reqOrCtx as Kintsugi.Context;
        const n: Kintsugi.MiddlewareNext =
          resOrNextOrHandlerInfo as Kintsugi.MiddlewareNext;

        nextFn = n;
        resp = c.response ?? c.resp;
        req = (c.req ?? c.request) as Kintsugi.MinRequest;
        ctx = c;
      } else {
        // Then it is a request and serve handler info is provided
        const rq: Kintsugi.MinRequest = reqOrCtx as Kintsugi.MinRequest;
        /*
         * Currently Serve Handler Info is not used
         * const _h: Kintsugi.ServeHandlerInfo = resOrNextOrHandlerInfo as Kintsugi.ServeHandlerInfo;
         */

        nextFn = undefined;
        req = rq;
        ctx = {} as Kintsugi.Context;
      }
    } else {
      // Then only reqOrCtx is provided meaning it is a context
      // Single param overload

      // Decide if reqOrCtx is a context or a request
      if ("req" in reqOrCtx || "request" in reqOrCtx) {
        // Then it is a context
        const c: Kintsugi.Context = reqOrCtx as Kintsugi.Context;
        req = (c.req ?? c.request) as Kintsugi.MinRequest;
        resp = c.resp ?? c.response;
        nextFn = c.next;
        ctx = c;
      } else {
        // Then it is a request
        req = reqOrCtx as Kintsugi.MinRequest;
        ctx = {} as Kintsugi.Context;
      }
    }

    AppContext.req = req as Kintsugi.MinRequest;
    AppContext.method = req.method as HTTPMethod;
    AppContext.next = nextFn as Kintsugi.MiddlewareNext;
    AppContext.params = this.#handler.getPathParams(pathname, req.url);

    // If no response is provided, we need to create a new response type object with custom methods
    resp = resp ?? {
      body: "",
    };

    if (!resp.headers) {
      resp.headers = new Headers();
    }

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
      set: (value) => {
        resp.status = value;
      },
    });

    Object.defineProperty(AppContext, "headers", {
      get: () => {
        return resp.headers;
      },
    });

    AppContext.set = (headerName: string, headerValue: string) => {
      if (resp.set) {
        resp.set(headerName, headerValue);
      }

      if (AppContext.headers?.set) {
        AppContext.headers.set(headerName, headerValue);
      }
    };

    AppContext.send = () => {
      if (resp.send) resp.send(AppContext.body as string);
      return new Response(AppContext.body as string, {
        status: AppContext.status,
        headers: AppContext.headers,
      });
    };

    return AppContext;
  }

  /**
   * Universal middleware handler that processes incoming requests and routes them to appropriate federation handlers.
   * @private
   * @overload
   * @param {Kintsugi.MiddlewareParams["ctx"]} ctx - Context object containing request and response
   * @returns {Kintsugi.MiddlewareParams["return"]} Response object
   */
  async #middleware(
    ctx: Kintsugi.MiddlewareParams["ctx"],
  ): Kintsugi.MiddlewareParams["return"];
  /**
   * Universal middleware handler that processes incoming requests and routes them to appropriate federation handlers.
   * @private
   * @overload
   * @param {Kintsugi.MiddlewareParams["req"]} req - Request object
   * @returns {Kintsugi.MiddlewareParams["return"]} Response object
   */
  async #middleware(
    req: Kintsugi.MiddlewareParams["req"],
  ): Kintsugi.MiddlewareParams["return"];
  /**
   * @private
   * @overload
   * @param {Kintsugi.MiddlewareParams["ctx"]} ctx - Context object containing request and response
   * @param {Kintsugi.MiddlewareParams["next"]} next - Next middleware function
   * @returns {Kintsugi.MiddlewareParams["return"]} Promise resolving to void or Response
   */
  async #middleware(
    ctx: Kintsugi.MiddlewareParams["ctx"],
    next: Kintsugi.MiddlewareParams["next"],
  ): Kintsugi.MiddlewareParams["return"];
  /**
   * @private
   * @overload
   * @param {Kintsugi.MiddlewareParams["req"]} req - Request object
   * @param {Kintsugi.MiddlewareParams["handlerInfo"]} handlerInfo - Handler info object
   * @returns {Kintsugi.MiddlewareParams["return"]} Promise resolving to void or Response
   */
  async #middleware(
    req: Kintsugi.MiddlewareParams["req"],
    handlerInfo: Kintsugi.MiddlewareParams["handlerInfo"],
  ): Kintsugi.MiddlewareParams["return"];
  /**
   * @private
   * @overload
   * @param {Kintsugi.MiddlewareParams["req"]} req - Request object
   * @param {Kintsugi.MiddlewareParams["res"]} res - Response object
   * @param {Kintsugi.MiddlewareParams["next"]} next - Next middleware function
   * @returns {Kintsugi.MiddlewareParams["return"]} Promise resolving to void or Response
   */
  async #middleware(
    req: Kintsugi.MiddlewareParams["req"],
    res: Kintsugi.MiddlewareParams["res"],
    next: Kintsugi.MiddlewareParams["next"],
  ): Kintsugi.MiddlewareParams["return"];

  // The actual definition of the middleware function that needs to filter out the request/response/next params depending on the overload
  async #middleware(
    reqOrCtx: Kintsugi.MiddlewareParams["reqOrCtx"],
    resOrNextOrHandlerInfo?:
      Kintsugi.MiddlewareParams["resOrNextOrHandlerInfo"],
    next?: Kintsugi.MiddlewareParams["next"],
  ): Kintsugi.MiddlewareParams["return"] {
    let ctx: Kintsugi.AppContext;

    const matchedRoute = this.#handler.matchRoute(reqOrCtx);

    if (matchedRoute !== undefined) {
      ctx = this.#normalizeContext(
        matchedRoute,
        reqOrCtx,
        resOrNextOrHandlerInfo,
        next,
      );

      // Get the route handler function for the matched route and method
      const routeHandler = await this.#handler.getRouteFn(
        matchedRoute,
        ctx.method as HTTPMethod,
      );
      if (routeHandler) {
        return await routeHandler(ctx);
      }
    }

    throw new Error("[Kintsugi] No route handler found");
  }

  /**
   * Gets the unique instance ID of this App instance.
   * @returns {UUID} The instance UUID
   */
  get id(): UUID {
    return this.#instance_id;
  }

  /**
   * Fetch handler for use with default export for deno serve.
   * This will catch any errors and return a 500 response.
   */
  public fetch: (
    request: Request,
    handlerInfo: Kintsugi.ServeHandlerInfo,
  ) => Promise<Response> = async (request, handlerInfo) => {
    try {
      const response = await this.#middleware(request, handlerInfo);
      return response;
    } catch (_error) {
      return new Response("[Kintsugi]: Internal Server Error", {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
  };
}
