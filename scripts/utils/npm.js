const { exec } = require("./util");

const NPM_URL = "https://registry.npmjs.org";
const GITHUB_URL = "https://npm.pkg.github.com";

function getNpmDistTag(version) {
	const pre = /alpha|beta|rc/i.exec(version);
	return pre ? pre[0].toLowerCase() : "latest";
}

function checkVersionExists(packageName, version, registry) {
	try {
		exec(`npm view ${packageName}@${version} --registry=${registry}`, {
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
	getNpmDistTag,
	checkVersionExists,
};
