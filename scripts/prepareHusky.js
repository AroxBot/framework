if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
	process.exit(0);
}
const husky = require("husky").default;
console.log(husky());
