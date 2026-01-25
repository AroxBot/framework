const { exec } = require("./util");
const path = require("node:path");

function isPrerelease(version) {
	return /alpha|beta|rc/i.test(version);
}

function getRepoInfo() {
	const repo = process.env.GITHUB_REPOSITORY;
	if (!repo) {
		throw new Error("GITHUB_REPOSITORY not found");
	}

	const [owner, name] = repo.split("/");
	return { owner, repo: name };
}

function getSha() {
	const sha = process.env.GITHUB_SHA;
	if (!sha) {
		throw new Error("GITHUB_SHA not found");
	}
	return sha;
}

function tagExists(tag) {
	try {
		const result = exec(
			`gh api repos/${process.env.GITHUB_REPOSITORY}/git/matching-refs/tags/${tag}`
		);
		return JSON.parse(result).length > 0;
	} catch {
		return false;
	}
}

async function createRelease(version, tgzPath, body = "") {
	const sha = getSha();

	console.log(`Creating GitHub Release & Tag: ${version}`);

	const prereleaseFlag = isPrerelease(version) ? "--prerelease" : "";
	const notes = body || `Release ${version}`;
	const assetPath = tgzPath ? path.resolve(tgzPath) : "";

	let command = `gh release create ${version} ${assetPath} \
        --target ${sha} \
        --title "${version}" \
        --notes "${notes}" \
        ${prereleaseFlag}`;

	exec(command, { stdio: "inherit" });

	console.log(`Release ${version} successfully published.`);
}

module.exports = { getRepoInfo, getSha, tagExists, createTag, createRelease };
