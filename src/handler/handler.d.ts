type Routes = {
  [path: string]: RouteHandler;
};

type RouteHandlerFn = (ctx: AppContext) => Response;

type RouteHandler = {
  [key in HTTPMethod]?: RouteHandlerFn;
};

type ExtractPathParams<T extends string> = T extends
  `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractPathParams<Rest>]: string }
  : T extends `${infer _Start}:${infer Param}` ? { [k in Param]: string }
  : Record<string | number | symbol, never>;
