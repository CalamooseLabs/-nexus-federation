declare namespace KintsugiHandler {
  type Routes = {
    [path: string]: RoutePath;
  };

  type RoutePath = `/${string}`;

  type RouteHandlerFn = (
    ctx: Kintsugi.AppContext,
  ) => Response | Promise<Response>;

  type ExtractPathParams<T extends string> = T extends
    `${infer Start}/${infer Rest}`
    ? Start extends `:${infer Param}`
      ? { [k in Param]: string } & ExtractPathParams<Rest>
    : ExtractPathParams<Rest>
    : T extends `:${infer Param}` ? { [k in Param]: string }
    : Record<string, never>;
}
