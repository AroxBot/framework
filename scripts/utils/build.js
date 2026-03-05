import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import pack from "libnpmpack";
import { exec } from "./util.js";

export default async function buildPackage(tempjson) {
	try {
		console.log("Installing dependencies");
		exec("npm ci", { stdio: "inherit" });

		console.log("Building project");
		exec("npm run build", { env: { ...process.env }, stdio: "inherit" });
	} catch (err) {
		console.error("Build failed, aborting release");
		throw err;
	}

	delete tempjson.scripts;
	delete tempjson.devDependencies;
	await writeFile(
		path.join(process.cwd(), "package.json"),
		JSON.stringify(tempjson)
	);
	console.log("Packing npm...");
	const tarballBuffer = await pack(process.cwd());
	const tempPath = path.join(tmpdir(), "publish.tgz");
	await writeFile(tempPath, tarballBuffer);
	console.log(`Written tarball to temp path: ${tempPath}`);
	return tempPath;
}
