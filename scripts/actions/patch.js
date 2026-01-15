const path = require("node:path");
const fs = require("node:fs/promises");

const PLACEHOLDER_REGEX = /\[VI\]\{\{(.+?)\}\}\[\/VI\]/g;
const packageJson = require("../../package.json");

async function patch() {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const distDir = path.resolve("dist");

  async function getAllJsFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          return getAllJsFiles(fullPath);
        }

        if (
          entry.isFile() &&
          (fullPath.endsWith(".js") || fullPath.endsWith(".mjs"))
        ) {
          return [fullPath];
        }

        return [];
      })
    );

    return files.flat();
  }

  const jsFiles = await getAllJsFiles(distDir);
  console.log(`Found ${jsFiles.length} JavaScript files`);

  for (const file of jsFiles) {
    const content = await fs.readFile(file, "utf8");

    if (!PLACEHOLDER_REGEX.test(content)) continue;

    const patched = content.replace(PLACEHOLDER_REGEX, (_match, key) => {
      switch (key) {
        case "version":
          return getVersion();
        case "name":
          return packageJson.name;
        default:
          return _match;
      }
    });

    await fs.writeFile(file, patched, "utf8");
    console.log(`Patched: ${file}`);
  }
}

function getVersion() {
  return `v${packageJson?.version ?? "0.0.1"}`;
}

if (require.main === module) {
  patch().catch((err) => {
    console.error("Patch failed:", err);
    process.exit(1);
  });
}

module.exports = patch;
