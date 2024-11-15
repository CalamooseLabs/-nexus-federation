for await (const dirEntry of Deno.readDir("./")) {
  console.log(dirEntry.name);
}
