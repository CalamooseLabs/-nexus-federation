const cmd = new Deno.Command(Deno.execPath(), {
  args: ["task", "all-tests"],
});

const { code, stdout } = await cmd.output();

const output = new TextDecoder().decode(stdout);

console.log(code);
console.log(output);
