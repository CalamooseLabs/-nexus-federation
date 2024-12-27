// @ts-self-types="./router.d.ts"

export class Router {
  #getRoutes: Map<
    string,
    KintsugiRouter.Handler
  > = new Map();
  #postRoutes: Map<
    string,
    KintsugiRouter.Handler
  > = new Map();
  #staticPath: string | null = null;

  get(
    path: string,
    handler: KintsugiRouter.Handler,
  ) {
    this.#getRoutes.set(path, handler);
  }

  post(
    path: string,
    handler: KintsugiRouter.Handler,
  ) {
    this.#postRoutes.set(path, handler);
  }

  static(path: string) {
    this.#staticPath = path;
  }

  private matchRoute(
    path: string,
    route: string,
  ): Record<string, string> | null {
    const pathParts = path.split("/").filter(Boolean);
    const routeParts = route.split("/").filter(Boolean);
    if (pathParts.length !== routeParts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  async #handleRequest(ctx: Kintsugi.Context): KintsugiRouter.ExternalResponse {
    const req = ctx.req ?? (ctx.request as unknown as Request);
    const url = new URL(req.url ?? "");
    const path = url.pathname;

    if (req.method === "GET") {
      for (const [route, handler] of this.#getRoutes.entries()) {
        const params = this.matchRoute(path, route);
        if (params) return handler(ctx);
      }

      if (this.#staticPath) {
        try {
          const filePath = `${this.#staticPath}${path}`;
          const file = await Deno.readFile(filePath);
          const contentType = this.#getContentType(filePath);
          return new Response(file, {
            status: 200,
            headers: { "Content-Type": contentType },
          });
        } catch {
          return new Response("File not found", { status: 404 });
        }
      }
    }

    if (req.method === "POST") {
      for (const [route, handler] of this.#postRoutes.entries()) {
        const params = this.matchRoute(path, route);
        if (params) return handler(ctx);
      }
    }

    return new Response("Not found", { status: 404 });
  }

  #getContentType(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "html":
        return "text/html";
      case "js":
        return "application/javascript";
      case "css":
        return "text/css";
      case "json":
        return "application/json";
      case "png":
        return "image/png";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      default:
        return "application/octet-stream";
    }
  }

  public listen() {
    Deno.serve((req) => {
      console.log("Router activated.");
      return this.#handleRequest({ req } as unknown as Kintsugi.Context);
    });
  }

  // JSX rendering helper
  // render(component: React.ReactElement): Response {
  //   const html = ReactDOMServer.renderToString(component);
  //   return new Response(`<!DOCTYPE html><html><body>${html}</body></html>`, {
  //     headers: { "Content-Type": "text/html" },
  //   });
  // }
}
