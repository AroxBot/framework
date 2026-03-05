import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function exec(command, options = {}) {
	const { stdio = ["ignore", "pipe", "pipe"], encoding = "utf-8" } = options;
	return execSync(command, {
		...options,
		stdio,
		encoding,
	});
}

export function generateChangelog(version) {
	return exec(`git-cliff --tag ${version} --unreleased`).trim();
}

export function isMain(importMetaUrl) {
	const entry = process.argv[1];
	return entry ? importMetaUrl === pathToFileURL(entry).href : false;
}
