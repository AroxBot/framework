import packageJson from "../../package.json" with { type: "json" };
import build from "../utils/build.js";
import {
	getRepoInfo,
	getSha,
	tagExists,
	createRelease,
} from "../utils/github.js";
import {
	checkVersionExists,
	GITHUB_URL,
	publishTarball,
} from "../utils/npm.js";
import { generateChangelog, isMain } from "../utils/util.js";

async function runGitHubRelease() {
	const githubToken = process.env.GITHUB_TOKEN;
	if (!githubToken) {
		throw new Error("Github Token Not Found");
	}

	const { owner, repo } = getRepoInfo();
	const sha = getSha();

	const releasePackageJson = {
		...packageJson,
		name: `@${owner}/${packageJson.name}`,
	};

	const version = releasePackageJson.version;

	if (!version) {
		throw new Error("package.json version not found");
	}

	console.log("Starting GitHub Release Process");
	console.log(`Repository: ${owner}/${repo}`);
	console.log(`Version: ${version}`);
	console.log(`Current commit: ${sha.slice(0, 7)}`);

	const npmVerExists = checkVersionExists(
		releasePackageJson.name,
		version,
		GITHUB_URL
	);
	const githubTagExists = tagExists(version);

	let buildPath = null;
	const ensureBuildPath = async () => {
		buildPath ??= await build(releasePackageJson);
		return buildPath;
	};

	if (githubTagExists) {
		console.log(`Tag (git) ${version} already exists`);
	} else {
		try {
			console.log(`Git tag ${version} does not exist`);

			const tarballPath = await ensureBuildPath();

			const changelog = generateChangelog(version);
			createRelease(version, tarballPath, changelog);
		} catch (error) {
			console.log(error);
			throw new Error("Failed to create GitHub release");
		}
	}

	if (npmVerExists) {
		console.log(`Version (npm) ${version} already exists`);
	} else {
		try {
			console.log(`npm version ${version} does not exist`);

			const tarballPath = await ensureBuildPath();

			publishTarball(tarballPath, GITHUB_URL, version);
		} catch (error) {
			console.log(error);
			throw new Error("Failed to publish package to GitHub Packages");
		}
	}
}

if (isMain(import.meta.url)) {
	runGitHubRelease().catch((err) => {
		console.error("Patch failed:", err);
		process.exit(1);
	});
}
