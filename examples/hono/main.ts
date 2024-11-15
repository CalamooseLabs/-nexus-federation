import { Hono } from "jsr:@hono/hono";
import HerdApp from "../../src/app/app.ts";

const app = new Hono();

app.get("/", (_ctx) => new Response("Welcome to the Hono API!"));

const herd = new HerdApp();

const middleware = herd.middleware;

// app.use((_ctx, next) => {
//   console.log("middleware");
//   return next();
// });

app.use(middleware);

export default app;
