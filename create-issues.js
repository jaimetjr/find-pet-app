const fs = require("fs");
const { execSync } = require("child_process");
const os = require("os");
const path = require("path");

const file = "github-issues.md";
const content = fs.readFileSync(file, "utf8");

console.log(content);
// Match each block starting with ## Issue #
const issueBlocks = content.split(/^## Issue #[\d]+:/gm).slice(1); // discard text before first issue

if (issueBlocks.length === 0) {
  console.log("⚠️ No issues found in the markdown file.");
  process.exit(1);
}

console.log(`🚀 Found ${issueBlocks.length} issues. Creating on GitHub...`);

issueBlocks.forEach((block, index) => {
  const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/);
  const descriptionMatch = block.match(/\*\*Description:\*\*\s*([\s\S]+?)(\n###|$)/);

  const title = titleMatch?.[1]?.trim();
  const body = descriptionMatch?.[1]?.trim();

  if (!title || !body) {
    console.warn(`⚠️ Skipping issue #${index + 1}: missing title or description`);
    return;
  }

  console.log(`📌 Creating issue: ${title}`);
  try {
    const tmpFile = path.join(os.tmpdir(), `issue-${Date.now()}-${index + 1}.md`);
    fs.writeFileSync(tmpFile, body, "utf8");
    execSync(`gh issue create --title "${title}" --body-file "${tmpFile}"`, {
      stdio: "inherit",
    });
    fs.unlinkSync(tmpFile);
  } catch (err) {
    console.error(`❌ Failed to create issue: ${title}`);
  }
});

// Optional: Clear the file
fs.writeFileSync(file, "", "utf8");
console.log(`🧹 Cleared ${file} after creating issues.`);