import { Hono } from "jsr:@hono/hono";
import { App as InternalApp } from "../../src/mod.ts";

const app = new Hono();

app.get("/", (_ctx) => new Response("Welcome to the Hono API!"));

const internalApp = new InternalApp();

const middleware = internalApp.middleware;

// app.use((_ctx, next) => {
//   console.log("middleware");
//   return next();
// });

app.use(middleware);

export default app;
