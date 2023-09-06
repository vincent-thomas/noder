#!/urs/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generatePackageJson } from "./generators/package.json";
import { join, resolve } from "node:path";
import { build } from "tsup";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { generateMain } from "./generators/main.ts";

function run() {

  const cli = yargs(hideBin(process.argv));

  cli.command("new", "Create a new project", yarg => yarg.positional("destination", {
    describe: "Project name",
    default: "test"
  }).option("name", {
    string: true
  }).option("linting", {
    choices: ["none", "prettier", "eslint", "eslint-prettier"],
    default: "eslint"
  }), async (args) => {
    const packageJson = await generatePackageJson(args.name || "noder-project", "It's best practice to have a description", { usingTypes: true, wantsLinting: args.linting as "prettier" });
    const main = generateMain();
    mkdirSync(args.destination, {recursive: true});
    mkdirSync(`${args.destination}/src`, {recursive: true});
    writeFileSync(resolve(`${args.destination}/package.json`), packageJson);
    writeFileSync(resolve(`${args.destination}/src/main.ts`), main);
  }).command("build", "Build the project", (yarg) => yarg.option("type", {
    choices: ["lib", "app"],
    default: "lib"
  }).option("tsconfig", {default: "./tsconfig.json"}).option("watch", {default: false, boolean: true}), async (args) => {
    const destination = args._[1] !== undefined ? String(args._[1]) : ".";
    const configPath = resolve(`${destination}/noder.config.json`);
    const packagePath = resolve(`${destination}/package.json`);
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));

    const outputDir = config.outputDir || "dist";
    const tsConfig = resolve(`${destination}/${args.tsconfig}`);
    if (!args.watch) {
      process.stdout.write("Building: " + packageJson.name + "...");
    }
    await build({
      entry: [config.entry],
      outDir: join(destination, outputDir),
      treeshake: true,
      clean: true,
      tsconfig: tsConfig,
      watch: args.watch,
      dts: args.type === "lib" && config.entry.includes(".ts"),
      splitting: false,
      format: "esm",
      bundle: true,
      silent: !args.watch 
    })
    if (!args.watch) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write("Building: Done\n");
      process.stdout.write(`Output at: ${resolve(outputDir)}\n\n`);
    }
  }).parse()
};

run()