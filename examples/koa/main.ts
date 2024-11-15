// @deno-types="npm:@types/koa@2.15.0"
import Koa from "npm:koa@2.15.0";
import HerdApp from "../../src/app/app.ts";

const app = new Koa();

const herd = new HerdApp();

const middleware = herd.middleware;

// app.use(async (ctx) => {
//   ctx.body = "Hello World";
// });

app.use(middleware);

console.log("Listening on port 8000");
app.listen(8000);