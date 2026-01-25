const { exec } = require("../utils/util");
const {
	getRepoInfo,
	getSha,
	tagExists,
	//createTag,
	createRelease,
} = require("../utils/github");
const {
	checkVersionExists,
	GITHUB_URL,
	getNpmDistTag,
} = require("../utils/npm");

const packageJson = require("../../package.json");
const build = require("../utils/build");
const { generateChangelog } = require("../utils/util");

async function buildProject() {
	const github_token = process.env.GITHUB_TOKEN;
	if (!github_token) {
		throw new Error("Github Token Not Found");
	}

	const { owner, repo } = getRepoInfo();
	const sha = getSha();

	const tempjson = {
		...packageJson,
		name: `@${owner}/${packageJson.name}`,
	};

	const version = tempjson.version;

	if (!version) {
		throw new Error("package.json version not found");
	}

	console.log("Starting GitHub Release Process");
	console.log(`Repository: ${owner}/${repo}`);
	console.log(`Version: ${version}`);
	console.log(`Current commit: ${sha.slice(0, 7)}`);

	const npmVerExists = checkVersionExists(tempjson.name, version, GITHUB_URL);
	const githubTagExists = tagExists(version);

	let buildPath = null;
	let err = false;

	if (githubTagExists) {
		console.log(`Tag (git) ${version} already exists`);
	} else {
		try {
			console.log(`Git tag ${version} does not exist`);

			buildPath ??= await build(tempjson);

			//createTag(version, sha);

			const changelog = generateChangelog(version);
			await createRelease(version, buildPath, changelog);
		} catch (error) {
			console.log(error);
			err = true;
		}
	}

	if (npmVerExists) {
		console.log(`Version (npm) ${version} already exists`);
	} else {
		try {
			console.log(`npm version ${version} does not exist`);

			buildPath ??= await build(tempjson);

			const distTag = getNpmDistTag(version);
			const tagArg = distTag === "latest" ? "" : ` --tag ${distTag}`;
			exec(`npm publish "${buildPath}" --registry=${GITHUB_URL}${tagArg}`, {
				stdio: "inherit",
			});
		} catch (error) {
			console.log(error);
			err = true;
		}

		if (err) throw new Error("Failed to publish");
	}
}

if (require.main === module) {
	buildProject().catch((err) => {
		console.error("Patch failed:", err);
		process.exit(1);
	});
}
