declare namespace Kintsugi {
  type MiddlewareResponse = Promise<void | Response>;

  type MiddlewareNext = (error?: unknown) => MiddlewareResponse;

  type TypedContext<T extends string> = Required<AppContext> & {
    params: KintsugiHandler.ExtractPathParams<T>;
  };

  interface AdjustedResponse extends Omit<Omit<Response, "body">, "headers"> {
    body: string;
    headers: HeaderObject | Headers;
  }

  type HTTPBody =
    | string
    | number
    | bigint
    | boolean
    | symbol
    | object
    | undefined
    | null;

  type MinRequest = {
    url: string | URL;
    headers?: Headers;
    method: string;
    body?: HTTPBody;
  };

  type HTTPBodyFunction = () => HTTPBody | Promise<HTTPBody>;

  interface MinResponse {
    body?: HTTPBody | HTTPBodyFunction;
    end?: () => void;
    status?: number;
    send?: (body?: HTTPBody) => void;
    set?: (name: string, value: string) => void;
    headers?: Headers;
  }

  interface SendOptions {
    root: string;
    [key: string]:
      | string
      | boolean
      | Record<string, string>
      | string[]
      | number;
  }

  interface Context {
    req?: MinRequest;
    request?: MinRequest;
    resp?: MinResponse;
    response?: MinResponse;
    next?: MiddlewareNext;
    body?: HTTPBody | HTTPBodyFunction;
    send?: (
      options: SendOptions,
    ) => Promise<void | Response | string> | void | Response | string;
    url?: string | URL;
    method?: string;
  }

  interface AppContext {
    req: MinRequest; // the original request object
    resp: MinResponse; // the original response object
    next: MiddlewareNext; // the next function
    body: HTTPBody | HTTPBodyFunction; // the body of the response
    status: number; // the status of the response
    params: Record<string, string>; // the path parameters
    send: () => void | Response | Promise<Response>; // the send method that will return a response
    set: (headerName: string, headerValue: string) => void; // the set method that will set a header
    headers: Headers; // the headers of the response
    method: HTTPMethod; // the method of the request
  }

  type ServeHandlerInfo = {
    remoteAddr?: Deno.Addr;
  };

  type PluginFn = () => void;

  interface NormalizeContextParams {
    pathname: string;
    reqOrCtx: Kintsugi.Context | Kintsugi.MinRequest;
    resOrNextOrHandlerInfo?:
      | Kintsugi.MinResponse
      | Kintsugi.MiddlewareNext
      | Kintsugi.ServeHandlerInfo;
    next?: Kintsugi.MiddlewareNext;
  }

  interface MiddlewareParams {
    ctx: Kintsugi.Context;
    req: Kintsugi.MinRequest;
    res: Kintsugi.MinResponse;
    next: Kintsugi.MiddlewareNext;
    handlerInfo: Kintsugi.ServeHandlerInfo;

    reqOrCtx:
      | Kintsugi.MiddlewareParams["req"]
      | Kintsugi.MiddlewareParams["ctx"];
    resOrNextOrHandlerInfo?:
      | Kintsugi.MiddlewareParams["res"]
      | Kintsugi.MiddlewareParams["next"]
      | Kintsugi.MiddlewareParams["handlerInfo"];
    nextOrHandlerInfo?:
      | Kintsugi.MiddlewareParams["next"]
      | Kintsugi.MiddlewareParams["handlerInfo"];

    return: Promise<Response>;
  }

  type MiddlewareFunction = {
    // Single parameter overloads
    (
      ctx: Kintsugi.MiddlewareParams["ctx"],
    ): Kintsugi.MiddlewareParams["return"];
    (
      req: Kintsugi.MiddlewareParams["req"],
    ): Kintsugi.MiddlewareParams["return"];

    // Two parameter overloads
    (
      ctx: Kintsugi.MiddlewareParams["ctx"],
      next: Kintsugi.MiddlewareParams["next"],
    ): Kintsugi.MiddlewareParams["return"];
    (
      req: Kintsugi.MiddlewareParams["req"],
      handlerInfo: Kintsugi.MiddlewareParams["handlerInfo"],
    ): Kintsugi.MiddlewareParams["return"];

    // Three parameter overload
    (
      req: Kintsugi.MiddlewareParams["req"],
      res: Kintsugi.MiddlewareParams["res"],
      next: Kintsugi.MiddlewareParams["next"],
    ): Kintsugi.MiddlewareParams["return"];

    // Base implementation signature
    (
      reqOrCtx: Kintsugi.MiddlewareParams["reqOrCtx"],
      resOrNextOrHandlerInfo?:
        Kintsugi.MiddlewareParams["resOrNextOrHandlerInfo"],
      next?: Kintsugi.MiddlewareParams["next"],
    ): Kintsugi.MiddlewareParams["return"];
  };
}
