const { execSync } = require("node:child_process");

function exec(command, options = {}) {
	return execSync(command, {
		...options,
		stdio: ["ignore", "pipe", "pipe"],
		encoding: "utf-8",
	});
}

function generateChangelog(version) {
	return exec(`git-cliff --tag ${version} --unreleased`).trim();
}

module.exports = { exec, generateChangelog };
