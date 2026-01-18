import FastGlob from "fast-glob";
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
	if (!require.main?.filename) {
		return process.cwd();
	}

	return path.dirname(require.main.filename);
}
