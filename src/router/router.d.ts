declare namespace Router {
  type Handler = (ctx: Kintsugi.Context) => Promise<Response> | Response;
  type ExternalResponse = Promise<Response>;
}
