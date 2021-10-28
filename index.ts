import { builtinModules } from "module";
import { readFile } from "fs/promises";
import esbuild from "esbuild";
import enhancedResolve from "enhanced-resolve";

const resolve = (
  resolveDir: string,
  path: string,
  options: Partial<enhancedResolve.ResolveOptions>
) => {
  return new Promise<string>((fulfill, reject) => {
    enhancedResolve.create(options)(
      path,
      resolveDir,
      (err: unknown, result: string) => {
        err ? reject(err) : fulfill(result);
      }
    );
  });
};

const aliasFields = (platform: esbuild.Platform | undefined) => {
  return platform === "browser" ? ["browser"] : [];
};

const mainFields = (platform: esbuild.Platform | undefined) => {
  return platform === "browser"
    ? ["browser", "module", "main"]
    : ["module", "main"];
};

const conditionNames = (
  importKind: esbuild.ImportKind,
  platform: esbuild.Platform | undefined
) => {
  const conditionNames: string[] = [];
  switch (importKind) {
    case "dynamic-import":
    case "import-statement":
      conditionNames.push("import");
      break;
    case "require-call":
    case "require-resolve":
      conditionNames.push("require");
  }
  if (platform === "node") {
    conditionNames.push("node");
  }
  return conditionNames;
};

export const enhancedResolvePlugin = ({
  filter = /()/,
  load = true,
}: {
  filter?: RegExp;
  load?: boolean;
} = {}): esbuild.Plugin => {
  return {
    name: "enhanced-resolve",
    setup: async (build) => {
      build.onResolve({ filter }, async (args) => {
        if (builtinModules.includes(args.path)) {
          return;
        }
        return {
          path: await resolve(args.path, args.resolveDir || process.cwd(), {
            aliasFields: aliasFields(build.initialOptions.platform),
            mainFields:
              build.initialOptions.mainFields ??
              mainFields(build.initialOptions.platform),
            conditionNames:
              build.initialOptions.conditions ??
              conditionNames(args.kind, build.initialOptions.platform),
          }),
        };
      });
      if (load) {
        build.onLoad({ filter }, async (args) => {
          return {
            contents: await readFile(args.path),
          };
        });
      }
    },
  };
};
