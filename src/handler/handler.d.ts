type Routes = {
  [path: string]: RouteHandler;
};

type RouteHandlerFn = (ctx: AppContext) => Response | Promise<Response>;

type RouteHandler = {
  [key in HTTPMethod]?: RouteHandlerFn;
};

type ExtractPathParams<T extends string> = T extends
  `${infer Start}/${infer Rest}`
  ? Start extends `:${infer Param}`
    ? { [k in Param]: string } & ExtractPathParams<Rest>
  : ExtractPathParams<Rest>
  : T extends `:${infer Param}` ? { [k in Param]: string }
  : Record<string, never>;
