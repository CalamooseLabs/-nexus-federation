import { App as HerdApp } from "#app";
import { assertEquals } from "jsr:@std/assert";

const FEDERATION_MANIFEST_PATH = "/_federation/manifest.json";

Deno.test("Integration Tests:", async (task) => {
  const herd = new HerdApp();
  const middleware = herd.middleware;

  const BASE_PORT = 8123;
  let currentPort = BASE_PORT;

  const MANIFEST_CONTENT = "This is the manifest.json response";

  const getManifest = async () => {
    try {
      const response = await fetch(
        `http://localhost:${currentPort}${FEDERATION_MANIFEST_PATH}`,
      );
      const manifest = await response.text();

      assertEquals(response.status, 200);
      assertEquals(manifest, MANIFEST_CONTENT);
    } finally {
      currentPort++;
    }
  };

  async function withHTTP(createServer: () => { close: () => void }) {
    const server = await createServer();
    try {
      await getManifest();
    } finally {
      server.close();
    }
  }

  await task.step("Hono Middleware Integration:", async (honoTask) => {
    await honoTask.step("Latest Version", async () => {
      const { Hono } = await import("jsr:@hono/hono");
      const app = new Hono();
      app.use(middleware);

      await withHTTP(() => {
        const controller = new AbortController();
        Deno.serve({
          port: currentPort,
          signal: controller.signal,
          onListen: () => {},
        }, app.fetch);
        return {
          close: () => controller.abort(),
        };
      });
    });

    await honoTask.step("Oldest Supported Version", async () => {
      const { Hono } = await import("jsr:@hono/hono@4.4.0");
      const app = new Hono();
      app.use(middleware);

      await withHTTP(() => {
        const controller = new AbortController();
        Deno.serve({
          port: currentPort,
          signal: controller.signal,
          onListen: () => {},
        }, app.fetch);
        return {
          close: () => controller.abort(),
        };
      });
    });
  });

  await task.step("Oak Middleware Integration:", async (oakTask) => {
    await oakTask.step("Latest Version", async () => {
      const { Application } = await import("jsr:@oak/oak");
      const app = new Application();
      app.use(middleware);

      await withHTTP(() => {
        const controller = new AbortController();
        app.listen({ port: currentPort, signal: controller.signal });
        return {
          close: () => controller.abort(),
        };
      });
    });

    await oakTask.step("Oldest Supported Version", async () => {
      const { Application } = await import("jsr:@oak/oak@17.0.0");
      const app = new Application();
      app.use(middleware);

      await withHTTP(() => {
        const controller = new AbortController();
        app.listen({ port: currentPort, signal: controller.signal });
        return {
          close: () => controller.abort(),
        };
      });
    });
  });

  await task.step("Fresh 2.0 Middleware Integration:", async (freshTask) => {
    await freshTask.step("Latest Version", async () => {
      const { App: Fresh } = await import("jsr:@fresh/core@2.0.0-alpha.25");
      const app = new Fresh();
      app.use(middleware);

      await withHTTP(() => {
        const controller = new AbortController();
        app.listen({
          port: currentPort,
          signal: controller.signal,
          onListen: () => {},
        });
        return {
          close: () => controller.abort(),
        };
      });
    });
  });

  await task.step("ExpressJS Middleware Integration:", async (expressTask) => {
    await expressTask.step("Latest Version", async () => {
      const express = (await import("npm:express")).default;
      const app = express();
      app.use(middleware);

      await withHTTP(() => {
        const server = app.listen(currentPort);
        return {
          close: () => server.close(),
        };
      });
    });

    await expressTask.step("Oldest Supported Version", async () => {
      const express = (await import("npm:express@5.0.0")).default;
      const app = express();
      app.use(middleware);

      await withHTTP(() => {
        const server = app.listen(currentPort);
        return {
          close: () => server.close(),
        };
      });
    });
  });

  await task.step("Koa Middleware Integration:", async (koaTask) => {
    await koaTask.step("Latest Version", async () => {
      const koa = (await import("npm:koa")).default;
      const app = new koa();
      app.use(middleware);

      await withHTTP(() => {
        const server = app.listen(currentPort);
        return {
          close: () => server.close(),
        };
      });
    });

    await koaTask.step("Oldest Supported Version", async () => {
      const koa = (await import("npm:koa@2.0.0")).default;
      const app = new koa();
      app.use(middleware);

      await withHTTP(() => {
        const server = app.listen(currentPort);
        return {
          close: () => server.close(),
        };
      });
    });
  });
});
