import fs from "node:fs/promises";
import path from "node:path";

const filePath = path.resolve("dist/index.d.cts");
const content = `import type * as Arox from "./index.js";
export = Arox;
`;

await fs.writeFile(filePath, content, "utf8");
console.log("Generated dist/index.d.cts");
