import esbuild from "esbuild";
import enhancedResolve from "enhanced-resolve";
import { builtinModules } from "module";

const plugin = ({
  filter = /()/,
}: {
  filter?: RegExp;
} = {}): esbuild.Plugin => {
  return {
    name: "enhanced-resolve",
    setup: async (build) => {
      build.onResolve({ filter }, async (args) => {
        if (build.initialOptions.external?.includes(args.path)) {
          return;
        }

        const isNode =
          build.initialOptions.platform === "node" ||
          build.initialOptions.conditions?.includes("node");

        if (
          isNode &&
          [
            ...builtinModules,
            ...builtinModules.map((module) => `node:${module}`),
          ].includes(args.path)
        ) {
          return;
        }

        const isBrowser =
          build.initialOptions.platform === undefined ||
          build.initialOptions.platform === "browser" ||
          build.initialOptions.conditions?.includes("browser") ||
          build.initialOptions.mainFields?.includes("browser");

        const isImport =
          args.kind === "dynamic-import" || args.kind === "import-statement";

        const isRequire =
          args.kind === "require-call" || args.kind === "require-resolve";

        const pick = (o: object) =>
          Object.entries(o).flatMap(([key, value]) => (value ? key : []));

        const resolve = enhancedResolve.create({
          extensions: build.initialOptions.resolveExtensions ?? [
            ".tsx",
            ".ts",
            ".jsx",
            ".js",
            ".css",
            ".json",
          ],
          conditionNames:
            build.initialOptions.conditions ??
            pick({
              import: isImport,
              require: isRequire,
              node: isNode,
            }),
          mainFields:
            build.initialOptions.mainFields ??
            pick({
              browser: isBrowser,
              module: isImport,
              main: true,
            }),
          aliasFields: pick({
            browser: isBrowser,
          }),
        });

        const resolved = await new Promise<string | false | undefined>(
          (fulfill, reject) =>
            resolve(
              args.resolveDir,
              args.path,
              (err: Error, _: unknown, resolved: { path: string }) =>
                err ? reject(err) : fulfill(resolved.path)
            )
        );

        if (resolved === false) {
          return {
            external: true,
          };
        }

        if (resolved) {
          return {
            path: resolved,
          };
        }
      });
    },
  };
};

export default plugin;
module.exports = plugin;
plugin["default"] = plugin;
