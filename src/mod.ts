export * from "./config/mod.ts";
export * from "./app/mod.ts";
export * from "./builder/mod.ts";
export * from "./handler/mod.ts";
export * from "./loader/mod.ts";
export * from "./router/mod.ts";

export const IS_BROWSER = (): boolean => typeof window !== "undefined";