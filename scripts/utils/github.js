const { exec } = require("./util");

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
    { stdio: "inherit" },
  );
}
async function createRelease(version, tgzPath, body = "") {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) throw new Error("GITHUB_REPOSITORY not found");

  console.log(`🚀 Creating GitHub Release: ${version}`);

  const prerelease = isPrerelease(version);

  const releaseJson = exec(
    `gh api repos/${repo}/releases \
      -X POST \
      -f tag_name=${version} \
      -f name=${version} \
      -f body="${body || `Release ${version}`}" \
      -F draft=false \
      -F prerelease=${prerelease}`,
  );

  const release = JSON.parse(releaseJson);
  console.log(`Release created (id=${release.id})`);

  if (tgzPath) {
    const resolved = path.resolve(tgzPath);

    console.log(`Uploading asset: ${resolved}`);

    exec(
      `gh api ${release.upload_url.replace(/\{.*$/, "")} \
        -X POST \
        -H "Content-Type: application/gzip" \
        -f name=install.tgz \
        --input "${resolved}"`,
      { stdio: "inherit" },
    );
  }

  return release;
}

module.exports = { getRepoInfo, getSha, tagExists, createTag, createRelease };
