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
        if (builtinModules.includes(args.path)) {
          return undefined;
        }

        const isNode =
          build.initialOptions.platform === "node" ||
          build.initialOptions.conditions?.includes("node");

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

        return {
          path: await new Promise((fulfill, reject) =>
            resolve(
              args.resolveDir,
              args.path,
              (err: Error, resolved: string) =>
                err ? reject(err) : fulfill(resolved)
            )
          ),
        };
      });
    },
  };
};

export default plugin;
module.exports = plugin;
plugin["default"] = plugin;
