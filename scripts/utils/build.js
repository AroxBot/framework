const { exec } = require("./util");

const { writeFile } = require("node:fs/promises");
const path = require("node:path");
const pack = require("libnpmpack");
const { tmpdir } = require("node:os");

module.exports = async function buildPackage(tempjson) {
	try {
		console.log("Installing dependencies");
		exec("npm ci", { stdio: "inherit" });

		console.log("Building project");
		exec("npm run build", { env: { ...process.env }, stdio: "inherit" });
	} catch (err) {
		console.error("Build failed, aborting release");
		throw err;
	}
	await writeFile(
		path.join(process.cwd(), "package.json"),
		JSON.stringify(tempjson, null, 2)
	);
	console.log("Packing npm...");
	const tarballBuffer = await pack(process.cwd());
	const tempPath = path.join(tmpdir(), "publish.tgz");
	await writeFile(tempPath, tarballBuffer);
	console.log(`Written tarball to temp path: ${tempPath}`);
	return tempPath;
};
