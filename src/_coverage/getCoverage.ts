import config from "../deno.json" with { type: "json" };

async function runTests(type: string, coverageDir: string) {
  let reportType: string;
  const srcDir = `${Deno.cwd()}`;
  const args: string[] = [
    "test",
    `${srcDir}`,
    "-REN",
  ];

  if (type === "all") {
    reportType = "All";
  } else if (type === "unit") {
    args.push("--filter", "Unit");
    reportType = "Unit";
  } else if (type === "integration") {
    args.push("--filter", "Integration");
    reportType = "Integration";
  } else {
    throw new Error(`Invalid test type: ${type}`);
  }

  args.push(`--coverage=${coverageDir}`);

  console.log(
    `\x1b[1m\x1b[33m[${reportType} Tests Report]:\x1b[0m Running ${type} tests and saving coverage to ${coverageDir}`,
  );

  const cmd = new Deno.Command(Deno.execPath(), {
    args,
  });

  const { code, stderr } = await cmd.output();
  if (code !== 0) {
    const error = new TextDecoder().decode(stderr);
    throw new Error(`${type} tests failed: ${error}`);
  }

  const coverageGenerator = new Deno.Command(Deno.execPath(), {
    args: ["coverage", coverageDir, "--html"],
  });

  const { code: coverageCode, stderr: coverageError } = await coverageGenerator
    .output();
  if (coverageCode !== 0) {
    const covError = new TextDecoder().decode(coverageError);
    throw new Error(`Failed to generate coverage report: ${covError}`);
  }

  const fullPath = `file://${coverageDir}/html/index.html`;

  console.log(
    `\x1b[1m\x1b[33m[${reportType} Tests Report]:\x1b[0m \x1b[4m\x1b[34m\x1b]8;;${fullPath}\x1b\\View Coverage Report\x1b]8;;\x1b\\\x1b[0m`,
  );

  console.log(
    `\x1b[1m\x1b[33m[${reportType} Tests Report]:\x1b[0m \x1b[32mDone!\x1b[0m`,
  );
}

export async function getFolder(args: string[]): Promise<void> {
  const c = config as { version: string };
  const version = c?.version ?? "unknown";
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") + "-" +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");

  const type = args.find((arg) => arg.includes("--"))?.replace("--", "");

  const coverageRoot =
    `${Deno.cwd()}/_coverage/${type}-tests/${version}/${timestamp}`;
  await Deno.mkdir(coverageRoot, { recursive: true });

  await runTests(type as string, coverageRoot);
}

getFolder(Deno.args);
