require("dotenv").config();
const axios = require("axios");

const {
  GITHUB_TOKEN,
  GITHUB_REPO,
  TRELLO_KEY,
  TRELLO_TOKEN,
  TRELLO_LIST_ID
} = process.env;

if (!GITHUB_REPO || !GITHUB_TOKEN || !TRELLO_KEY || !TRELLO_TOKEN || !TRELLO_LIST_ID) {
  console.error("❌ Missing environment variables. Please check your .env file.");
  process.exit(1);
}

async function fetchGitHubIssues() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/issues`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json"
    }
  });

  // Filter out pull requests
  return res.data.filter(issue => !issue.pull_request);
}

async function createTrelloCard(title, description) {
  const url = "https://api.trello.com/1/cards";
  const params = new URLSearchParams({
    key: TRELLO_KEY,
    token: TRELLO_TOKEN,
    idList: TRELLO_LIST_ID,
    name: title.slice(0, 512),
    desc: description || "(No description)"
  });

  try {
    const response = await axios.post(url, params);
    console.log(`✅ Trello card created: ${response.data.name}`);
  } catch (error) {
    console.error("❌ Error creating Trello card:", error.response?.data || error.message);
  }
}

(async () => {
  console.log("📥 Fetching GitHub issues...");
  const issues = await fetchGitHubIssues();

  for (const issue of issues) {
    console.log(`🔄 Syncing issue: ${issue.title}`);
    await createTrelloCard(issue.title, issue.body);
  }

  console.log("✅ All GitHub issues synced to Trello.");
})();