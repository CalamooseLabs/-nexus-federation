import { App, type FreshContext } from "jsr:@fresh/core@2.0.0-alpha.25";
import HerdApp from "../../src/app/app.ts";

const app = new App();

app.get("/", (_ctx: FreshContext) => new Response("Welcome to the Fresh API!"));

const herd = new HerdApp();

const middleware = herd.middleware;

// app.use((_ctx) => {
//   console.log("middleware");
//   return new Response("middleware");
// });

app.use(middleware);

app.listen({ port: 8000 });
