import { App as InternalApp } from "#app";
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertObjectMatch,
} from "jsr:@std/assert";

const FEDERATION_MANIFEST_PATH = "/_federation/manifest.json";

Deno.test("Unit Tests:", async (subtest) => {
  const testApp = new InternalApp();

  await subtest.step("Constructor - No Arguments", () => {
    assertEquals(testApp instanceof InternalApp, true);
  });

  await subtest.step("Constructor - With Arguments", () => {
    const testApp = new InternalApp({
      basePath: "/_doesntmatter",
      version: "1.0.0",
      remoteMap: {},
    });

    assertEquals(testApp instanceof InternalApp, true);
  });

  await subtest.step("UUID per instance", () => {
    const testApp2 = new InternalApp();
    assertNotEquals(testApp.id, testApp2.id);

    //Check if Class Instance ID is a valid UUID
    assert(
      testApp.id.match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      ),
    );
    assert(
      testApp2.id.match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      ),
    );
  });

  await subtest.step("Empty Parameters Expects to Exit Early", () => {
    testApp.middleware({});
  });
});

Deno.test("Integration Tests:", async (task) => {
  const testApp = new InternalApp();
  const middleware = testApp.middleware;

  const BASE_PORT = 8123;
  let currentPort = BASE_PORT;

  const MANIFEST_CONTENT = { "version": "1.0.0" };

  const getManifest = async () => {
    try {
      const response = await fetch(
        `http://localhost:${currentPort}${FEDERATION_MANIFEST_PATH}`,
      );
      assertEquals(response.status, 200);
      // Get the content type from the headers but remove the charset
      assertEquals(
        response.headers.get("Content-Type")?.split(";")[0],
        "application/json",
      );

      const manifest = await response.json();

      assertObjectMatch(manifest, MANIFEST_CONTENT);
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

  await task.step("Deno.Serve Integration:", async (denoServeTask) => {
    await denoServeTask.step("Only Request", async () => {
      await withHTTP(() => {
        const controller = new AbortController();
        Deno.serve({
          port: currentPort,
          signal: controller.signal,
          onListen: () => {},
        }, (req) => middleware(req));
        return {
          close: () => controller.abort(),
        };
      });
    });

    await denoServeTask.step("Request and Serve Handler Info", async () => {
      await withHTTP(() => {
        const controller = new AbortController();
        Deno.serve({
          port: currentPort,
          signal: controller.signal,
          onListen: () => {},
        }, middleware);
        return {
          close: () => controller.abort(),
        };
      });
    });

    await denoServeTask.step("Only Request (as fetch)", async () => {
      await withHTTP(() => {
        const controller = new AbortController();
        Deno.serve({
          port: currentPort,
          signal: controller.signal,
          onListen: () => {},
        }, testApp.fetch);
        return {
          close: () => controller.abort(),
        };
      });
    });

    await denoServeTask.step(
      "Request and Serve Handler Info (as fetch)",
      async () => {
        await withHTTP(() => {
          const controller = new AbortController();
          Deno.serve({
            port: currentPort,
            signal: controller.signal,
            onListen: () => {},
          }, (req, info) => testApp.fetch(req, info));
          return {
            close: () => controller.abort(),
          };
        });
      },
    );

    await denoServeTask.step(
      "Req inside context",
      async () => {
        await withHTTP(() => {
          const controller = new AbortController();
          Deno.serve({
            port: currentPort,
            signal: controller.signal,
            onListen: () => {},
          }, (req, _info) => middleware({req}));
          return {
            close: () => controller.abort(),
          };
        });
      },
    );

    await denoServeTask.step(
      "Request inside context",
      async () => {
        await withHTTP(() => {
          const controller = new AbortController();
          Deno.serve({
            port: currentPort,
            signal: controller.signal,
            onListen: () => {},
          }, (request, _info) => middleware({request}));
          return {
            close: () => controller.abort(),
          };
        });
      },
    );

    // Have this at the end because it's the slowest and the port hangs if it's not the last test
    await denoServeTask.step(
      "Request and Serve Handler Info (as fetch) - Empty Request",
      async () => {
        const controller = new AbortController();
        try {
          Deno.serve({
            port: currentPort,
            signal: controller.signal,
            onListen: () => {},
          }, (_req, info) => testApp.fetch({} as Request, info));

          const response = await fetch(
            `http://localhost:${currentPort}${FEDERATION_MANIFEST_PATH}`,
          );
          assertEquals(response.status, 200);

          const emptyResponse = await response.text();
          assertEquals(emptyResponse, "");
        } finally {
          controller.abort();
          currentPort++;
        }
      },
    );
  });
});
