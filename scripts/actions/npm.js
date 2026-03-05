import packageJson from "../../package.json" with { type: "json" };
import build from "../utils/build.js";
import { getSha } from "../utils/github.js";
import { checkVersionExists, NPM_URL, getNpmDistTag } from "../utils/npm.js";
import { exec, isMain } from "../utils/util.js";

async function buildProject() {
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
	console.log(`Version: ${version}`);
	console.log(`Current commit: ${sha.slice(0, 7)}`);

	const npmVerExists = checkVersionExists(tempjson.name, version, NPM_URL);

	let buildPath = null;
	const ensureBuildPath = async () => {
		buildPath ??= await build(tempjson);
		return buildPath;
	};

	if (npmVerExists) {
		console.log(`Version (npm) ${version} already exists`);
	} else {
		try {
			console.log(`npm version ${version} does not exist`);

			const tarballPath = await ensureBuildPath();

			const distTag = getNpmDistTag(version);
			const tagArg = distTag === "latest" ? "" : ` --tag ${distTag}`;
			exec(
				`npm publish "${tarballPath}" --provenance --registry=${NPM_URL}${tagArg}`,
				{
					stdio: "inherit",
				}
			);
		} catch (error) {
			console.log(error);
			throw new Error("Failed to publish package to npm");
		}
	}
}

if (isMain(import.meta.url)) {
	buildProject().catch((err) => {
		console.error("Patch failed:", err);
		process.exit(1);
	});
}
