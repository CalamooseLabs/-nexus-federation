export const GET = (ctx: AppContext) => {
  ctx.body = "This is the manifest.json response";
  ctx.status = 200;

  return ctx.send();
};
