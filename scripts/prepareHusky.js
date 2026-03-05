if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
	process.exit(0);
}
import huskyPackage from "husky";

const husky = huskyPackage.default ?? huskyPackage;
console.log(husky());
