import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const requiredFiles = ['index.html', 'feed.xml', 'searchIndex.json', 'graph.json', 'siteStats.json', 'sw.js'];
const maxFeedBytes = 5 * 1024 * 1024;

for (const relativePath of requiredFiles) {
  const filePath = path.join(distDir, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing build output: ${relativePath}`);
  }
}

const feed = fs.readFileSync(path.join(distDir, 'feed.xml'), 'utf8');
const feedBytes = Buffer.byteLength(feed);
if (feedBytes > maxFeedBytes) {
  throw new Error(`Feed is too large: ${feedBytes} bytes (limit ${maxFeedBytes})`);
}
if (!feed.includes('<summary type="text">') || feed.includes('<content type="html">')) {
  throw new Error('Feed must contain text summaries instead of full HTML content');
}

const stats = JSON.parse(fs.readFileSync(path.join(distDir, 'siteStats.json'), 'utf8'));
if (!Number.isInteger(stats.pageCount) || stats.pageCount <= 0) {
  throw new Error('Build statistics are missing a valid pageCount');
}

console.log(`Build verification passed: ${stats.pageCount} pages, feed ${feedBytes} bytes`);
