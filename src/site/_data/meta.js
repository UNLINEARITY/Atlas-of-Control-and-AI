require("dotenv").config();
const { globSync } = require("glob");
const fs = require('fs');

module.exports = async (data) => {
  let baseUrl = process.env.SITE_BASE_URL || "";
  if (baseUrl && !baseUrl.startsWith("http")) {
    baseUrl = "https://" + baseUrl;
  }
  let themeStyle = globSync("src/site/styles/_theme.*.css")[0] || "";
  if (themeStyle) {
    themeStyle = themeStyle.split("site")[1];
  }
  let bodyClasses = [];
  let noteIconsSettings = {
    filetree: false,
    links: false,
    title: false,
    default: process.env.NOTE_ICON_DEFAULT,
  };

  const styleSettingsCss = process.env.STYLE_SETTINGS_CSS || "";
  const styleSettingsBodyClasses = process.env.STYLE_SETTINGS_BODY_CLASSES || "";

  if (process.env.NOTE_ICON_TITLE && process.env.NOTE_ICON_TITLE == "true") {
    bodyClasses.push("title-note-icon");
    noteIconsSettings.title = true;
  }
  if (
    process.env.NOTE_ICON_FILETREE &&
    process.env.NOTE_ICON_FILETREE == "true"
  ) {
    bodyClasses.push("filetree-note-icon");
    noteIconsSettings.filetree = true;
  }
  if (
    process.env.NOTE_ICON_INTERNAL_LINKS &&
    process.env.NOTE_ICON_INTERNAL_LINKS == "true"
  ) {
    bodyClasses.push("links-note-icon");
    noteIconsSettings.links = true;
  }
  if (
    process.env.NOTE_ICON_BACK_LINKS &&
    process.env.NOTE_ICON_BACK_LINKS == "true"
  ) {
    bodyClasses.push("backlinks-note-icon");
    noteIconsSettings.backlinks = true;
  }
  if (styleSettingsCss) {
    bodyClasses.push("css-settings-manager");
  }
  if (styleSettingsBodyClasses) {
    bodyClasses.push(styleSettingsBodyClasses);
  }

  let timestampSettings = {
    timestampFormat: process.env.TIMESTAMP_FORMAT || "MMM dd, yyyy h:mm a",
    showCreated: process.env.SHOW_CREATED_TIMESTAMP == "true",
    showUpdated: process.env.SHOW_UPDATED_TIMESTAMP == "true",
  };

  // 统计页面数和链接数
  const noteFiles = globSync('src/site/notes/**/*.md');
  let pageCount = noteFiles.length;
  let linkCount = 0;
  let wordCount = 0;
  let formulaCount = 0;
  let imageCount = 0;
  noteFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/\[\[.*?\]\]/g);
    if (matches) linkCount += matches.length;
    // 统计字数（仅中文和英文单词/数字）
    const words = content.match(/[\u4e00-\u9fa5\w]+/g);
    if (words) wordCount += words.length;
    // 统计公式数（$...$ 或 $$...$$）
    const formulas = content.match(/\${1,2}[^$]+\${1,2}/g);
    if (formulas) formulaCount += formulas.length;
    // 统计图片数（![](...)）
    const images = content.match(/!\[[^\]]*\]\([^\)]+\)/g);
    if (images) imageCount += images.length;
  });
  const siteStats = { pageCount, linkCount, wordCount, formulaCount, imageCount };

  const meta = {
    env: process.env.ELEVENTY_ENV,
    theme: process.env.THEME,
    themeStyle,
    bodyClasses: bodyClasses.join(" "),
    noteIconsSettings,
    timestampSettings,
    baseTheme: process.env.BASE_THEME || "dark",
    siteName: process.env.SITE_NAME_HEADER || "Digital Garden",
    mainLanguage: process.env.SITE_MAIN_LANGUAGE || "en",
    siteBaseUrl: baseUrl,
    styleSettingsCss,
    buildDate: new Date(),
    siteStats,
  };

  return meta;
};
