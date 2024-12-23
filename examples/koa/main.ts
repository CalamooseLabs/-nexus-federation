// @deno-types="npm:@types/koa@2.15.0"
import Koa from "npm:koa@2.15.0";
import { App as InternalApp } from "../../src/mod.ts";

const app = new Koa();

const internalApp = new InternalApp();

const middleware = internalApp.middleware;

// app.use(async (ctx) => {
//   ctx.body = "Hello World";
// });

app.use(middleware);

console.log("Listening on port 8000");
app.listen(8000);
