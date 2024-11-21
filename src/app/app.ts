// @ts-self-types="./app.d.ts"

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
   * @param {AppConfig} [config] - Optional configuration object
   */
  constructor(config?: AppConfig) {
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
    resOrNextOrHandlerInfo?: MinResponse | MiddlewareNext | ServeHandlerInfo,
    next?: MiddlewareNext,
  ): AppContext {
    const AppContext: AppContext = {} as AppContext;

    let ctx: Context;
    let req: MinRequest;
    let resp: MinResponse | undefined;
    let nextFn: MiddlewareNext | undefined;

    if (next) {
      // Then all params are provided meaning resOrNext is a response and reqOrCtx is a request
      // Three param overload
      const n: MiddlewareNext = next as MiddlewareNext;
      const r: MinResponse = resOrNextOrHandlerInfo as MinResponse;
      const rq: MinRequest = reqOrCtx as MinRequest;

      nextFn = n;
      resp = r;
      req = rq;
      ctx = {};
    } else if (resOrNextOrHandlerInfo) {
      // Then next is provided meaning reqOrCtx is a context and resOrNext is a next function
      // Two param overload
      if (resOrNextOrHandlerInfo instanceof Function) {
        // Then it is a context and next is provided
        const c: Context = reqOrCtx as Context;
        const n: MiddlewareNext = resOrNextOrHandlerInfo as MiddlewareNext;

        nextFn = n;
        resp = c.response ?? c.resp;
        req = (c.req ?? c.request) as MinRequest;
        ctx = c;
      } else {
        // Then it is a request and serve handler info is provided
        const rq: MinRequest = reqOrCtx as MinRequest;
        const _h: ServeHandlerInfo = resOrNextOrHandlerInfo as ServeHandlerInfo;

        nextFn = undefined;
        req = rq;
        ctx = {} as Context;
      }
    } else {
      // Then only reqOrCtx is provided meaning it is a context
      // Single param overload

      //Decide if reqOrCtx is a context or a request
      if ("req" in reqOrCtx || "request" in reqOrCtx) {
        // Then it is a context
        const c: Context = reqOrCtx as Context;
        req = (c.req ?? c.request) as MinRequest;
        resp = c.resp ?? c.response;
        nextFn = c.next;
        ctx = c;
      } else {
        // Then it is a request
        req = reqOrCtx as MinRequest;
        ctx = {} as Context;
      }
    }

    AppContext.req = req as MinRequest;
    AppContext.method = req.method as HTTPMethod;
    AppContext.next = nextFn as MiddlewareNext;
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
      }
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
   * @param {Context} ctx - Context object containing request and response
   * @returns {Promise<Response>} Response object
   */
  async #middleware(ctx: Context): Promise<Response>;
  /**
   * Universal middleware handler that processes incoming requests and routes them to appropriate federation handlers.
   * @private
   * @overload
   * @param {MinRequest} req - Request object
   * @returns {Promise<Response>} Response object
   */
  async #middleware(req: MinRequest): Promise<Response>;
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
   * @param {MinRequest} req - Request object
   * @param {ServeHandlerInfo} handlerInfo - Handler info object
   * @returns {MiddlewareResponse} Promise resolving to void or Response
   */
  async #middleware(
    req: MinRequest,
    handlerInfo: ServeHandlerInfo,
  ): MiddlewareResponse;
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
    resOrNextOrHandlerInfo?: MinResponse | MiddlewareNext | ServeHandlerInfo,
    next?: MiddlewareNext,
  ): Promise<void | Response> {
    let ctx: AppContext;

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

    return;
  }

  /**
   * Gets the unique instance ID of this App instance.
   * @returns {UUID} The instance UUID
   */
  get id(): UUID {
    return this.#instance_id;
  }

  /**
   * Fetch handler for use with default export for deno serve
   * @param {Request} request - The incoming request
   * @param {ServeHandlerInfo} handlerInfo - The serve handler info
   * @returns {Promise<Response>} The response
   */
  public fetch: (
    request: Request,
    handlerInfo: ServeHandlerInfo,
  ) => Promise<Response> = (request, handlerInfo) => {
    const response = this.#middleware(request, handlerInfo);

    return response.then((res) => {
      if (res === undefined) {
        return new Response();
      }
      return res;
    });
  };
}

export { App };
