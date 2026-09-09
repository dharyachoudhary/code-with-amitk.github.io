import fs from "fs";
import { deflateSync } from "zlib";

const diagram = fs.readFileSync(
  "c:/go_here/dharya1/code-with-amitk.github.io/docs/System_Design/Scalable/Bump/_preview.mmd",
  "utf8"
);

function toPako() {
  const json = JSON.stringify({ code: diagram, mermaid: { theme: "base" } });
  const compressed = deflateSync(json, { level: 9 });
  return "pako:" + compressed.toString("base64url");
}

const encoded = toPako();
const url = "https://mermaid.ink/img/" + encoded;
console.log("url length", url.length);

const res = await fetch(url);
console.log("status", res.status, res.headers.get("content-type"));
if (!res.ok) {
  const text = await res.text();
  console.log(text.slice(0, 500));
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
const out =
  "c:/go_here/dharya1/code-with-amitk.github.io/docs/System_Design/Scalable/Bump/_preview.png";
fs.writeFileSync(out, buf);
console.log("wrote", out, buf.length);
