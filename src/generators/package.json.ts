
import latestVersion from "latest-version";

interface Options {
  wantsLinting: "none" | "eslint" | "prettier" | "eslint-prettier";
  usingTypes: boolean;
}

async function addBaseDeps() {
  const dev = {
    "@vincent-thomas/noder": await latestVersion("@vincent-thomas/noder"),
    "@types/node": await latestVersion("@types/node"),
  };
  return dev;
}

export async function generatePackageJson(name: string, description: string, options: Options) {

  let base: any = {
    name,
    description,
    version: "0.0.1",
    main: "dist/index.js",
    module: "dist/index.js",
    scripts: {
      lint: "tsc --noEmit",
      build: "noder build .",
    },
    devDependencies: await addBaseDeps()
  };

  if (options.usingTypes) {
    base = {
      ...base,
      types: "dist/index.d.ts"
    };
    base.devDependencies["typescript"] = await latestVersion("typescript");
  }

  if (options.wantsLinting && options.wantsLinting.includes("prettier")) {
    base.devDependencies["prettier"] = await latestVersion("prettier");
  }
  return JSON.stringify(base, undefined, 2);
};