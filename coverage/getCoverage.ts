import { parse } from "jsr:@std/jsonc";

async function runTests(type: string, coverageDir: string) {
  console.log(`Running ${type} tests and saving coverage to ${coverageDir}`);

  let testSuite: string;

  if (type === "all") {
    testSuite = "all-tests";
  } else if (type === "unit") {
    testSuite = "unit-tests";
  } else if (type === "integration") {
    testSuite = "integration-tests";
  } else {
    throw new Error(`Invalid test type: ${type}`);
  }

  const cmd = new Deno.Command("deno", {
    args: [
      "task",
      testSuite,
      "--coverage=" + coverageDir
    ],
  });
  
  const { success } = await cmd.output();
  if (!success) {
    throw new Error(`${type} tests failed`);
  }
}

export async function getFolder(args: string[]): Promise<void> {
  const config = (await parse(await Deno.readTextFile("deno.jsonc")) as { version?: string });
  if (!config) throw new Error("Failed to parse deno.jsonc");
  const version = config?.version ?? "unknown";
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") + "-" +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");

  if (args.includes("--unit")) {
    await runTests("unit", `coverage/unit-tests/${version}/${timestamp}`);
    return;
  }
  if (args.includes("--integration")) {
    await runTests("integration", `coverage/integration-tests/${version}/${timestamp}`);
    return;
  }
  if (args.includes("--all")) {
    await runTests("all", `coverage/all-tests/${version}/${timestamp}`);
    return;
  }

  throw new Error("Must specify --unit, --integration, or --all flag");
}

getFolder(Deno.args);