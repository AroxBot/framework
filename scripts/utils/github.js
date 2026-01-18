const { writeFileSync } = require("node:fs");
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
		exec(`gh api repos/${process.env.GITHUB_REPOSITORY}/git/ref/tags/${tag}`, {
			stdio: "ignore",
		});
		return true;
	} catch {
		return false;
	}
}

function createTag(tag, sha) {
	console.log(`Creating tag: ${tag}`);
	exec(
		`gh api repos/${process.env.GITHUB_REPOSITORY}/git/refs -X POST -f ref=refs/tags/${tag} -f sha=${sha}`,
		{ stdio: "inherit" }
	);
}

async function createRelease(version, tgzPath, body = "") {
	const repo = process.env.GITHUB_REPOSITORY;
	if (!repo) throw new Error("GITHUB_REPOSITORY not found");

	console.log(`🚀 Creating GitHub Release: ${version}`);

	const prerelease = isPrerelease(version);

	const payload = {
		tag_name: version,
		name: version,
		body: body || `Release ${version}`,
		draft: true,
		prerelease,
	};

	const tmp = ".release.json";
	writeFileSync(tmp, JSON.stringify(payload));

	const releaseJson = exec(
		`gh api repos/${repo}/releases -X POST --input ${tmp}`
	);

	const release = JSON.parse(releaseJson);
	console.log(`Release created (id=${release.id})`);

	if (tgzPath) {
		const resolved = path.resolve(tgzPath);

		console.log(`Uploading asset: ${resolved}`);

		exec(
			`gh api "${release.upload_url.replace(/\{.*$/, "")}?name=install.tgz" \
        -X POST \
        -H "Content-Type: application/gzip" \
        --input "${resolved}"`
		);
	}

	exec(`gh release publish ${version}`);

	return release;
}

module.exports = { getRepoInfo, getSha, tagExists, createTag, createRelease };
