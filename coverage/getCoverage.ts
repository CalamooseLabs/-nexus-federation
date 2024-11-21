import { parse } from "jsr:@std/jsonc";

async function runTests(type: string, coverageDir: string) {
  let testSuite: string;
  let reportType: string;

  if (type === "all") {
    testSuite = "all-tests";
    reportType = "All";
  } else if (type === "unit") {
    testSuite = "unit-tests";
    reportType = "Unit";
  } else if (type === "integration") {
    testSuite = "integration-tests";
    reportType = "Integration";
  } else {
    throw new Error(`Invalid test type: ${type}`);
  }

  console.log(
    `\x1b[1m\x1b[33m[${reportType} Tests Report]:\x1b[0m Running ${type} tests and saving coverage to ${coverageDir}`,
  );

  const cmd = new Deno.Command("deno", {
    args: [
      "task",
      testSuite,
      "--coverage=" + coverageDir,
    ],
  });

  const { success } = await cmd.output();
  if (!success) {
    throw new Error(`${type} tests failed`);
  }

  const coverageGenerator = new Deno.Command("deno", {
    args: ["coverage", coverageDir, "--html"],
  });

  const { success: coverageSuccess } = await coverageGenerator.output();
  if (!coverageSuccess) {
    throw new Error(`Failed to generate coverage report`);
  }

  const fullPath = `file://${Deno.cwd()}/${coverageDir}/html/index.html`;

  console.log(
    `\x1b[1m\x1b[33m[${reportType} Tests Report]:\x1b[0m \x1b[4m\x1b[34m\x1b]8;;${fullPath}\x1b\\View Coverage Report\x1b]8;;\x1b\\\x1b[0m`,
  );

  console.log(
    `\x1b[1m\x1b[33m[${reportType} Tests Report]:\x1b[0m \x1b[32mDone!\x1b[0m`,
  );
}

export async function getFolder(args: string[]): Promise<void> {
  const config = await parse(await Deno.readTextFile("deno.jsonc")) as {
    version?: string;
  };
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
    await runTests(
      "integration",
      `coverage/integration-tests/${version}/${timestamp}`,
    );
    return;
  }
  if (args.includes("--all")) {
    await runTests("all", `coverage/all-tests/${version}/${timestamp}`);
    return;
  }

  throw new Error("Must specify --unit, --integration, or --all flag");
}

getFolder(Deno.args);
