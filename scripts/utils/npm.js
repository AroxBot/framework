const { existsSync, appendFileSync, writeFileSync } = require("node:fs");
const { homedir } = require("node:os");

const NPM_URL = "https://registry.npmjs.org";
const GITHUB_URL = "https://npm.pkg.github.com";


const npmrcPath = join(homedir(), '.npmrc');
function generateNpmRc(githubToken, npmToken) {
  let line = "";
  if (githubToken) line = `${GITHUB_URL.replace("https:")}/:_authToken=${githubToken}\n`;
  if (npmToken) line = `${NPM_URL.replace("https:")}/:_authToken=${npmToken}\n`;

  if (existsSync(npmrcPath)) {
    appendFileSync(npmrcPath, line, { encoding: "utf8" });
  } else {
    writeFileSync(npmrcPath, line, { encoding: "utf8" });
  }

  console.log("Temporary .npmrc written for GitHub Registry authentication");
}

function getNpmDistTag(version) {
  const pre = /alpha|beta|rc/i.exec(version);
  return pre ? pre[0].toLowerCase() : "latest";
}

async function checkVersionExists(registryUrl, packageName, version, headers = {}) {
  const url = `${registryUrl}/${encodeURIComponent(packageName)}`;
  const res = await fetch(url, { headers });

  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`Failed to fetch registry info: ${res.status}`);
  const data = await res.json();
  return !!data.versions?.[version];
}

module.exports = {
  GITHUB_URL,
  NPM_URL,
  generateNpmRc,
  getNpmDistTag,
  checkVersionExists,
};
