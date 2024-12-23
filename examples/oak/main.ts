import { Application } from "jsr:@oak/oak";
import { App as InternalApp } from "../../src/mod.ts";

const app = new Application();

const internalApp = new InternalApp();

const middleware = internalApp.middleware;

// app.use((ctx, next) => {
//   console.log("middleware");
//   ctx.response.body = "middleware";
//   return next();
// });

app.use(middleware);

console.log("Server is running on port 8000");

await app.listen({ port: 8000 });
