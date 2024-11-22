import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertThrows,
} from "jsr:@std/assert";
import { Handler } from "#handler";

Deno.test("Unit Tests:", async (subtest) => {
  await subtest.step("Constructor", () => {
    const handler = new Handler(new URL("../app/routes", import.meta.url));
    assert(handler instanceof Handler);
  });

  await subtest.step("getPathParams", async (task) => {
    await task.step("No Match", () => {
      const handler = new Handler(new URL("../app/routes", import.meta.url));
      assertObjectMatch(handler.getPathParams("/users/:id", "/users"), {});
    });

    await task.step("Match", () => {
      const handler = new Handler(new URL("../app/routes", import.meta.url));
      assertObjectMatch(handler.getPathParams("/users/:id", "/users/123"), {
        id: "123",
      });
    });

    await task.step("Blank URL to throw error", () => {
      const handler = new Handler(new URL("../app/routes", import.meta.url));
      assertThrows(() => handler.getPathParams("/users/:id", ""));
    });
  });

  await subtest.step("getRouteFn", async (task) => {
    await task.step("No Match", async () => {
      const handler = new Handler(new URL("../app/routes", import.meta.url));
      assertEquals(await handler.getRouteFn("/users/:id", "GET"), undefined);
    });

    await task.step("Match", async () => {
      const handler = new Handler(new URL("../app/routes", import.meta.url));
      assert(
        (await handler.getRouteFn(
          "/_federation/manifest.json",
          "GET",
        )) instanceof
          Function,
      );
    });
  });

  await subtest.step("matchRoute", async (task) => {
    await task.step("No Match - Missing Method", () => {
      const handler = new Handler(new URL("../app/routes", import.meta.url));
      assertEquals(
        handler.matchRoute({ url: "/users" }),
        undefined,
      );
    });

    await task.step("Match - With mocked routes", () => {
      // Mock Deno.readDirSync to return our fake routes
      const originalReadDirSync = Deno.readDirSync;
      Deno.readDirSync = () => {
        return [
          {
            name: "users.ts",
            isFile: true,
            isDirectory: false,
            isSymlink: false,
            path: "/routes/users.ts",
          },
          {
            name: "[id].ts",
            isFile: true,
            isDirectory: false,
            isSymlink: false,
            path: "/routes/users/[id].ts",
          },
        ] as Iterable<Deno.DirEntry>;
      };

      try {
        const handler = new Handler(new URL("../app/routes", import.meta.url));
        
        // Test exact match
        assertEquals(
          handler.matchRoute({ url: "/_federation/routes/users", method: "GET" }),
          "/_federation/routes/users"
        );

        // Test parameter match
        assertEquals(
          handler.matchRoute({ url: "/_federation/routes/users/123", method: "GET" }),
          "/_federation/routes/users/:id"
        );

        // Test no match
        assertEquals(
          handler.matchRoute({ url: "/_federation/routes/invalid", method: "GET" }),
          undefined
        );
      } finally {
        // Restore original readDirSync
        Deno.readDirSync = originalReadDirSync;
      }
    });
  });
});
