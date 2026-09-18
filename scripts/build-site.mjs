import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", readFileSync("index.html", "utf8").replace("/src/ui/app.ts", "/ui/app.js"));
cpSync("src/ui/styles.css", "dist/ui/styles.css");
