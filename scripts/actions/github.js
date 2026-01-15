const { exec } = require("../utils/util");
const { getRepoInfo, getSha, tagExists, createTag, createRelease } = require("../utils/github");
const { generateNpmRc, checkVersionExists, GITHUB_URL } = require("../utils/npm");

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

  generateNpmRc(github_token, null);

  const npmVerExists = checkVersionExists(GITHUB_URL, tempjson.name, version, {
    Authorization: `Bearer ${github_token}`,
    Accept: "application/vnd.npm.install-v1+json",
  });

  const githubTagExists = tagExists(version);

  let buildPath = null;

  if (githubTagExists) {
    console.log(`Tag (git) ${version} already exists`);
  } else {
    console.log(`Git tag ${version} does not exist`);

    buildPath ??= await build(tempjson);

    createTag(version, sha);

    const changelog = generateChangelog(version);
    await createRelease(version, buildPath, changelog);
  }

  if (npmVerExists) {
    console.log(`Version (npm) ${version} already exists`);
  } else {
    console.log(`npm version ${version} does not exist`);

    buildPath ??= await build(tempjson);

    exec(`npm publish "${buildPath}" --registry=${GITHUB_URL}`, {
      stdio: "inherit",
    });
  }
}

if (require.main === module) {
  buildProject().catch((err) => {
    console.error("Patch failed:", err);
    process.exit(1);
  });
}
