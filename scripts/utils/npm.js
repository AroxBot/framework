const { existsSync, appendFileSync, writeFileSync } = require("node:fs");
const { homedir } = require("node:os");
const { join } = require("node:path");

const NPM_URL = "https://registry.npmjs.org";
const GITHUB_URL = "https://npm.pkg.github.com";

const npmrcPath = join(homedir(), ".npmrc");
function generateNpmRc(githubToken, npmToken) {
	let lines = "";
	if (githubToken) {
		lines += "@AroxBot:registry=https://npm.pkg.github.com\n";
		lines += "//npm.pkg.github.com/:_authToken=" + githubToken + "\n";
	}

	if (npmToken) {
		lines += "//registry.npmjs.org/:_authToken=" + npmToken + "\n";
	}

	if (existsSync(npmrcPath)) {
		appendFileSync(npmrcPath, lines, { encoding: "utf8" });
	} else {
		writeFileSync(npmrcPath, lines, { encoding: "utf8" });
	}

	console.log("Temporary .npmrc written for GitHub Registry authentication");
}

function getNpmDistTag(version) {
	const pre = /alpha|beta|rc/i.exec(version);
	return pre ? pre[0].toLowerCase() : "latest";
}

function checkVersionExists(packageName, version, registry) {
	try {
		execSync(`npm view ${packageName}@${version} --registry=${registry}`, {
			stdio: "ignore",
		});
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	GITHUB_URL,
	NPM_URL,
	generateNpmRc,
	getNpmDistTag,
	checkVersionExists,
};
