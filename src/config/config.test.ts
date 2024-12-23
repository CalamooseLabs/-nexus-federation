import { assert, assertEquals } from "jsr:@std/assert";
import { Config } from "#config";

import denoConfig from "../deno.json" with { type: "json" };

Deno.test("Unit Tests:", async (subtest) => {
  await subtest.step("Constructor - No Arguments", () => {
    const config = new Config();
    assert(config instanceof Config);
    assertEquals(config.version, (denoConfig as DenoJSON.Config).version);
  });

  await subtest.step("Constructor - With Arguments", () => {
    const config = new Config({
      basePath: "/_doesntmatter",
      version: "1.0.0",
      remoteMap: {},
    });
    assert(config instanceof Config);
    assertEquals(config.version, "1.0.0");
  });

  await subtest.step("Deno Config Error - Should Recover", () => {
    const config = new Config({
      configLocation: "/notfound.json",
      version: "1.0.0",
      remoteMap: {},
      basePath: "/_doesntmatter",
    });
    assert(config instanceof Config);
    assertEquals(config.version, "1.0.0");
  });

  await subtest.step("Deno Config - Mock Deno Config Override", () => {
    // Original `Deno.readTextFileSync`
    const originalReadTextFileSync = Deno.readTextFileSync;

    // Mock implementation of `Deno.readTextFileSync`
    Deno.readTextFileSync = (path: string | URL) => {
      if (path === "./deno.json") {
        return "{}";
      }
      // Call original function for other files
      return originalReadTextFileSync(path);
    };

    try {
      const config = new Config();
      assertEquals(config.version, "1.0.0");
      assert(config instanceof Config);
    } finally {
      // Restore original `Deno.readTextFile`
      Deno.readTextFileSync = originalReadTextFileSync;
    }
  });

  await subtest.step("Deno Config - Mock Deno Config Empty File", () => {
    // Original `Deno.readTextFileSync`
    const originalReadTextFileSync = Deno.readTextFileSync;

    // Mock implementation of `Deno.readTextFileSync`
    Deno.readTextFileSync = (path: string | URL) => {
      if (path === "./deno.json") {
        return "";
      }
      // Call original function for other files
      return originalReadTextFileSync(path);
    };

    try {
      const config = new Config();
      assertEquals(config.version, "1.0.0");
      assert(config instanceof Config);
    } finally {
      // Restore original `Deno.readTextFile`
      Deno.readTextFileSync = originalReadTextFileSync;
    }
  });
});
