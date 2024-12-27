export * from "#app";
export * from "#builder";
export * from "#config";
export * from "#handler";
export * from "#loader";
export * from "#router";

export const IS_BROWSER = (): boolean => typeof window !== "undefined";
