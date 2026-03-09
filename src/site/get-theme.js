require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");
const { globSync } = require("glob");

const themeCommentRegex = /\/\*[\s\S]*?\*\//g;

async function getTheme() {
  let themeUrl = process.env.THEME;
  if (!themeUrl) {
    return;
  }

  try {
    await axios.get(themeUrl);
  } catch {
    if (themeUrl.includes("theme.css")) {
      themeUrl = themeUrl.replace("theme.css", "obsidian.css");
    } else if (themeUrl.includes("obsidian.css")) {
      themeUrl = themeUrl.replace("obsidian.css", "theme.css");
    }
  }

  let res;
  try {
    res = await axios.get(themeUrl);
  } catch (error) {
    console.warn(`[get-theme] Failed to fetch theme from ${themeUrl}. Using existing local theme if available.`);
    return;
  }

  try {
    const existing = globSync("src/site/styles/_theme.*.css");
    existing.forEach((file) => {
      fs.rmSync(file);
    });
  } catch {}

  let skippedFirstComment = false;
  const data = res.data.replace(themeCommentRegex, (match) => {
    if (skippedFirstComment) {
      return "";
    }

    skippedFirstComment = true;
    return match;
  });

  const hashSum = crypto.createHash("sha256");
  hashSum.update(data);
  const hex = hashSum.digest("hex");
  fs.writeFileSync(`src/site/styles/_theme.${hex.substring(0, 8)}.css`, data);
}

getTheme().catch((error) => {
  console.warn(`[get-theme] Theme sync skipped: ${error.message}`);
});