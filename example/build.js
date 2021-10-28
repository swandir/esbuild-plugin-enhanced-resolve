const esbuild = require("esbuild");
const { enhancedResolvePlugin } = require("esbuild-plugin-enhanced-resolve");

esbuild.build({
  entryPoints: ["src/index.js"],
  platform: "node",
  bundle: true,
  outfile: "out/node.js",
  plugins: [enhancedResolvePlugin()],
});

esbuild.build({
  entryPoints: ["src/index.js"],
  platform: "browser",
  bundle: true,
  outfile: "out/browser.js",
  plugins: [enhancedResolvePlugin()],
});
