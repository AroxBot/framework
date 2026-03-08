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
const JS_EXTENSIONS = [".js", ".mjs", ".cjs"];

async function build() {
	await fs.rm(path.resolve("dist"), { recursive: true, force: true });

	const baseBuildOptions = {
		entryPoints: ["src/index.ts"],
		bundle: true,
		minify: true,
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

	await Promise.all([
		esbuild.build({
			...baseBuildOptions,
			format: "cjs",
			outfile: "dist/index.cjs",
		}),
		esbuild.build({
			...baseBuildOptions,
			format: "esm",
			outfile: "dist/index.js",
		}),
	]);
	await patch();

	console.log("Build + Patch completed");
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});

async function patch() {
	const distDir = path.resolve("dist");
	const jsFiles = await getAllJsFiles(distDir);
	console.log(`Found ${jsFiles.length} JavaScript files`);

	for (const file of jsFiles) {
		const content = await fs.readFile(file, "utf8");

		PLACEHOLDER_REGEX.lastIndex = 0;
		if (!PLACEHOLDER_REGEX.test(content)) continue;
		PLACEHOLDER_REGEX.lastIndex = 0;

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
				JS_EXTENSIONS.some((ext) => fullPath.endsWith(ext))
			) {
				return [fullPath];
			}
			return [];
		})
	);
	return files.flat();
}

function getVersion() {
	return `v${packageJson?.version ?? "0.0.1"}`;
}
