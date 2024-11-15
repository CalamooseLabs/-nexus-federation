// @deno-types="npm:@types/express@5.0.0"
import express, { type Request, type Response } from "npm:express@5.0.0";
import HerdApp from "../../src/app/app.ts";
const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the Express.js API!");
});

const herd = new HerdApp();

const middleware = herd.middleware;

// app.use((_req, res, _next) => {
//   res.send("Hello World");
// });

app.use("/", middleware);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
