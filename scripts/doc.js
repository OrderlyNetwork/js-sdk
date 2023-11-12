const TypeDoc = require("typedoc");
const fs = require("fs");
const path = require("path");

async function main() {
  const app = new TypeDoc.Application();
  // Application.bootstrap also exists, which will not load plugins
  // Also accepts an array of option readers if you want to disable
  // TypeDoc's tsconfig.json/package.json/typedoc.json option
  const hooksPath = path.resolve(__dirname, "../../../packages/hooks");


  await app.bootstrapWithPlugins({
    // entryPoints: ["src/index.ts"],
    entryPoints: [path.resolve(__dirname,'../packages/hooks/src/index.ts')],
    // tsconfig: path.resolve(hooksPath, "tsconfig.json"),
    
  });

  const project = await app.convert();

  if (project) {
    // Project may not have converted correctly
    const outputDir = "./docs";

    // Rendered docs
    // await app.generateDocs(project, outputDir);
    // Alternatively generate JSON output
    await app.generateJson(project, outputDir + "/documentation.json");
  }
}

main().catch(console.error);
