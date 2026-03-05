import FastGlob from "fast-glob";
import { existsSync } from "node:fs";
import path from "path";

export function getFiles(baseDir: string): string[] {
	return FastGlob.sync(["**/*.ts", "**/*.js"], {
		cwd: baseDir,
		absolute: true,
		ignore: [
			"**/*.d.ts",
			"node_modules/**",
			".git/**",
			"dist/**",
			"lib/**",
			"out/**",
			"build/**",
			".next/**",
			"coverage/**",
		],
	});
}
export function getProjectRoot(): string {
	const startDirs: string[] = [];

	startDirs.push(path.resolve(process.cwd()));

	const requireMainFilename =
		typeof require !== "undefined" ? require.main?.filename : undefined;
	if (requireMainFilename) {
		startDirs.push(path.dirname(path.resolve(requireMainFilename)));
	}

	if (typeof module !== "undefined" && module.parent?.filename) {
		startDirs.push(path.dirname(path.resolve(module.parent.filename)));
	}

	for (const startDir of startDirs) {
		const packageRoot = findNearestPackageRoot(startDir);
		if (packageRoot) {
			return packageRoot;
		}
	}

	return startDirs[0];
}

function findNearestPackageRoot(startDir: string): string | null {
	let current = path.resolve(startDir);
	while (true) {
		const packageJsonPath = path.join(current, "package.json");
		if (existsSync(packageJsonPath)) {
			return path.normalize(current);
		}

		const parent = path.dirname(current);
		if (parent === current) {
			return null;
		}
		current = parent;
	}
}
