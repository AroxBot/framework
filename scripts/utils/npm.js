import { exec } from "./util.js";

export const NPM_URL = "https://registry.npmjs.org";
export const GITHUB_URL = "https://npm.pkg.github.com";

export function getNpmDistTag(version) {
	const pre = /alpha|beta|rc/i.exec(version);
	return pre ? pre[0].toLowerCase() : "latest";
}

export function checkVersionExists(packageName, version, registry) {
	try {
		exec(`npm view ${packageName}@${version} --registry=${registry}`, {
			stdio: "ignore",
		});
		return true;
	} catch {
		return false;
	}
}
