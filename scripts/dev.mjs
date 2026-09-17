import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css" };
createServer(async (request, response) => {
  const path = request.url === "/" ? "index.html" : request.url?.slice(1) ?? "index.html";
  try { const body = await readFile(join(process.cwd(), "dist", path)); response.writeHead(200, { "content-type": types[extname(path)] ?? "text/plain" }); response.end(body); }
  catch { response.writeHead(404); response.end("Not found"); }
}).listen(5173, () => console.log("NEXUS development server: http://localhost:5173"));
