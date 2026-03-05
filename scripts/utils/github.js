import { execSync } from "node:child_process";
import path from "node:path";
import { exec } from "./util.js";

function isPrerelease(version) {
	return /alpha|beta|rc/i.test(version);
}

export function getRepoInfo() {
	const repo = process.env.GITHUB_REPOSITORY;
	if (!repo) {
		throw new Error("GITHUB_REPOSITORY not found");
	}

	const [owner, name] = repo.split("/");
	return { owner, repo: name };
}

export function getSha() {
	const sha = process.env.GITHUB_SHA;
	if (!sha) {
		throw new Error("GITHUB_SHA not found");
	}
	return sha;
}

export function tagExists(tag) {
	try {
		exec(`gh api repos/${process.env.GITHUB_REPOSITORY}/git/ref/tags/${tag}`, {
			stdio: "ignore",
		});
		return true;
	} catch {
		return false;
	}
}

export function createRelease(version, tgzPath, body = "") {
	const sha = getSha();

	console.log(`Creating GitHub Release & Tag: ${version}`);

	const prereleaseFlag = isPrerelease(version) ? "--prerelease" : "";
	const notes = body || `Release ${version}`;
	const assetPath = tgzPath ? path.resolve(tgzPath) : "";

	const command = `gh release create ${version} ${assetPath} \
    --target ${sha} \
    --title "${version}" \
    --notes-file - \
    ${prereleaseFlag}`;

	execSync(command, {
		input: notes,
		stdio: ["pipe", "inherit", "inherit"],
		encoding: "utf-8",
	});

	console.log(`Release ${version} successfully published.`);
}
