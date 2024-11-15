declare class Router {
  get: (
    path: string,
    responder: (ctx: Context) => Promise<Response> | Response,
    // deno-lint-ignore no-explicit-any
    ...middlewares: any[]
  ) => void;

  post: (
    path: string,
    responder: (ctx: Context) => Promise<Response> | Response,
    // deno-lint-ignore no-explicit-any
    ...middlewares: any[]
  ) => void;
}
