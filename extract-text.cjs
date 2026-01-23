const fs = require("fs");
const path = require("path");

function readDir(dir, output = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      readDir(fullPath, output);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, "utf8");
      const matches = content.match(/>([^<>]{3,})</g);
      if (matches) {
        matches.forEach(m => {
          const text = m.replace(/[<>]/g, "").trim();
          if (text.length > 3) output.push(text);
        });
      }
    }
  });
  return output;
}

const data = readDir("./src");
fs.writeFileSync("react_knowledge.txt", [...new Set(data)].join("\n\n"));
console.log("✅ Knowledge extracted to react_knowledge.txt");
