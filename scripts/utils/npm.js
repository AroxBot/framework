import { execFileSync } from "node:child_process";

export const NPM_URL = "https://registry.npmjs.org";
export const GITHUB_URL = "https://npm.pkg.github.com";

export function getNpmDistTag(version) {
	const pre = /alpha|beta|rc/i.exec(version);
	return pre ? pre[0].toLowerCase() : "latest";
}

export function checkVersionExists(packageName, version, registry) {
	try {
		execFileSync(
			"npm",
			["view", `${packageName}@${version}`, `--registry=${registry}`],
			{
				stdio: "ignore",
			}
		);
		return true;
	} catch {
		return false;
	}
}

export function publishTarball(tarballPath, registry, version, options = {}) {
	const { provenance = false } = options;
	const distTag = getNpmDistTag(version);
	const args = ["publish", tarballPath];
	if (provenance) {
		args.push("--provenance");
	}
	args.push(`--registry=${registry}`);
	if (distTag !== "latest") {
		args.push("--tag", distTag);
	}

	execFileSync("npm", args, { stdio: "inherit" });
}
