import fs from "fs";

const html = fs.readFileSync(
  "c:/go_here/dharya1/code-with-amitk.github.io/docs/System_Design/Scalable/Bump/index.html",
  "utf8"
);
const start = html.indexOf('<pre class="mermaid">');
const end = html.indexOf("</pre>", start);
const diagram = html.slice(start + '<pre class="mermaid">'.length, end).trim();
const encoded = Buffer.from(diagram, "utf8").toString("base64url");
const url = "https://mermaid.ink/img/" + encoded;
fs.writeFileSync(
  "c:/go_here/dharya1/code-with-amitk.github.io/docs/System_Design/Scalable/Bump/_preview.mmd",
  diagram
);
console.log(url);
