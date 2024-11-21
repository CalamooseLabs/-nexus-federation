import { App } from "#app";

const app = new App();

const request = new Request("http://localhost:8000/_federation/manifest.json");

console.log(request);

const response = await app.middleware(request);

console.log(response);

const r = new Response();

console.log(r);
