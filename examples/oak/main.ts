import { Application } from "jsr:@oak/oak";
import HerdApp from "../../src/app/app.ts";

const app = new Application();

const herd = new HerdApp();

const middleware = herd.middleware;

// app.use((ctx, next) => {
//   console.log("middleware");
//   ctx.response.body = "middleware";
//   return next();
// });

app.use(middleware);

console.log("Server is running on port 8000");

await app.listen({ port: 8000 });
