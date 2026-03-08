import packageJson from "../../package.json" with { type: "json" };
import build from "../utils/build.js";
import { getSha } from "../utils/github.js";
import { checkVersionExists, NPM_URL, publishTarball } from "../utils/npm.js";
import { isMain } from "../utils/util.js";

async function runNpmRelease() {
	const owner = process.env.NPM_ORG;
	const sha = getSha();

	const releasePackageJson = {
		...packageJson,
		name: owner ? `@${owner}/${packageJson.name}` : packageJson.name,
	};

	const version = releasePackageJson.version;

	if (!version) {
		throw new Error("package.json version not found");
	}

	console.log("Starting Npm Release Process");
	console.log(`Version: ${version}`);
	console.log(`Current commit: ${sha.slice(0, 7)}`);

	const npmVerExists = checkVersionExists(
		releasePackageJson.name,
		version,
		NPM_URL
	);

	let buildPath = null;
	const ensureBuildPath = async () => {
		buildPath ??= await build(releasePackageJson);
		return buildPath;
	};

	if (npmVerExists) {
		console.log(`Version (npm) ${version} already exists`);
	} else {
		try {
			console.log(`npm version ${version} does not exist`);

			const tarballPath = await ensureBuildPath();

			publishTarball(tarballPath, NPM_URL, version, { provenance: true });
		} catch (error) {
			console.log(error);
			throw new Error("Failed to publish package to npm");
		}
	}
}

if (isMain(import.meta.url)) {
	runNpmRelease().catch((err) => {
		console.error("Patch failed:", err);
		process.exit(1);
	});
}
