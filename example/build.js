const esbuild = require("esbuild");
const enhancedResolve = require("esbuild-plugin-enhanced-resolve");

esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "out/browser.js",
  plugins: [enhancedResolve()],
});

esbuild.build({
  entryPoints: ["src/index.js"],
  platform: "node",
  bundle: true,
  outfile: "out/node.js",
  plugins: [enhancedResolve()],
});
