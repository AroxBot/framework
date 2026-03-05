import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { builtinModules } from "node:module";
import Oxc from "unplugin-oxc/esbuild";

const PLACEHOLDER_REGEX = /\[VI\]\{\{(.+?)\}\}\[\/VI\]/g;
const require = createRequire(import.meta.url);
const packageJson = require("../package.json");
const dependencies = Object.keys(packageJson.dependencies ?? {});
const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});

async function build() {
	const baseBuildOptions = {
		entryPoints: ["src/index.ts"],
		bundle: true,
		platform: "node",
		target: "node25",
		sourcemap: false,
		tsconfig: "tsconfig.json",
		external: [
			...dependencies,
			...peerDependencies,
			"@discordjs/*",
			...builtinModules,
		],
		plugins: [Oxc()],
	};

	await esbuild.build({
		...baseBuildOptions,
		format: "cjs",
		outfile: "dist/index.cjs",
	});

	await esbuild.build({
		...baseBuildOptions,
		format: "esm",
		outfile: "dist/index.js",
	});
	await patch();

	console.log("Build + Patch completed");
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});

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
					(fullPath.endsWith(".js") ||
						fullPath.endsWith(".mjs") ||
						fullPath.endsWith(".cjs"))
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
