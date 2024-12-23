// @deno-types="npm:@types/express@5.0.0"
import express, { type Request, type Response } from "npm:express@5.0.0";
import { App as InternalApp } from "../../src/mod.ts";
const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the Express.js API!");
});

const internalApp = new InternalApp();

const middleware = internalApp.middleware;

// app.use((_req, res, _next) => {
//   res.send("Hello World");
// });

app.use("/", middleware);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
