const { exec } = require("../utils/util");
const {
	generateNpmRc,
	checkVersionExists,
	NPM_URL,
	getNpmDistTag,
} = require("../utils/npm");

const packageJson = require("../../package.json");
const build = require("../utils/build");

async function buildProject() {
	const npm_token = process.env.NPM_TOKEN;
	if (!npm_token) {
		throw new Error("NPM Token Not Found");
	}

	const owner = process.env.NPM_ORG;
	const sha = getSha();

	const tempjson = {
		...packageJson,
		name: owner ? `@${owner}/${packageJson.name}` : packageJson.name,
	};

	const version = tempjson.version;

	if (!version) {
		throw new Error("package.json version not found");
	}

	console.log("Starting Npm Release Process");
	console.log(`Repository: ${owner}/${repo}`);
	console.log(`Version: ${version}`);
	console.log(`Current commit: ${sha.slice(0, 7)}`);

	generateNpmRc(null, npm_token);

	const npmVerExists = checkVersionExists(NPM_URL, tempjson.name, version);

	let buildPath = null;
	let err = false;

	if (npmVerExists) {
		console.log(`Version (npm) ${version} already exists`);
	} else {
		try {
			console.log(`npm version ${version} does not exist`);

			buildPath ??= await build(tempjson);

			const distTag = getNpmDistTag(version);
			const tagArg = distTag === "latest" ? "" : ` --tag ${distTag}`;
			exec(`npm publish "${buildPath}" --registry=${NPM_URL}${tagArg}`, {
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
