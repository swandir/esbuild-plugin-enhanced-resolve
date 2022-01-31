const fs = require("fs/promises");
const esbuild = require("esbuild");
const enhancedResolve = require("esbuild-plugin-enhanced-resolve");

const readFile = () => ({
  name: "readFile",
  setup: (build) => {
    build.onLoad({ filter: /()/ }, async (args) => {
      return {
        contents: await fs.readFile(args.path),
        loader: "default",
      };
    });
  },
});

esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "out/browser.js",
  plugins: [
    enhancedResolve({
      alias: {
        tslib: "tslib/tslib.es6.js",
      },
    }),
    readFile(),
  ],
});

esbuild.build({
  entryPoints: ["src/index.js"],
  platform: "node",
  bundle: true,
  outfile: "out/node.js",
  plugins: [enhancedResolve(), readFile()],
});
