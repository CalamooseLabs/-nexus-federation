export const POST = (ctx: Kintsugi.AppContext) => {
  ctx.body = `{"version": "1.0.0"}`;
  ctx.status = 200;
  ctx.set("Content-Type", "application/json");

  return ctx.send();
};
