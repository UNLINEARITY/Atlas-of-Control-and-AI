const fs = require('fs');
const matter = require('gray-matter');

const wikiLinkRegex = /\[\[(.*?\|.*?)\]\]/g;
const internalLinkRegex = /href="\/(.*?)"/g;

function extractLinks(content) {
  return [
    ...(content.match(wikiLinkRegex) || []).map(
      (link) =>
        link
          .slice(2, -2)
          .split('|')[0]
          .replace(/\.(md|markdown)\s?$/i, '')
          .replace(/\\/g, '')
          .trim()
          .split('#')[0]
    ),
    ...(content.match(internalLinkRegex) || []).map(
      (link) =>
        link
          .slice(6, -1)
          .split('|')[0]
          .replace(/\.(md|markdown)\s?$/i, '')
          .replace(/\\/g, '')
          .trim()
          .split('#')[0]
    ),
  ];
}

function getGraph(data) {
  const nodes = {};
  const links = [];
  const stemURLs = {};
  let homeAlias = '/';

  (data.collections.note || []).forEach((v, idx) => {
    const isHome =
      v.data['dg-home'] ||
      (v.data.tags && v.data.tags.indexOf('gardenEntry') > -1);

    // Hard-exclude notes marked with hideInGraph, but keep the home node (even if hidden)
    // because the frontend graph script depends on its existence.
    if (v.data.hideInGraph === true && !isHome) {
      return;
    }

    const fpath = v.filePathStem.replace('/notes/', '');
    const parts = fpath.split('/');
    let group = 'none';
    if (parts.length >= 3) {
      group = parts[parts.length - 2];
    }

    const inputPath = v.inputPath || v.data.page?.inputPath;
    let rawContent = '';
    if (inputPath && fs.existsSync(inputPath)) {
      rawContent = matter(fs.readFileSync(inputPath, 'utf8')).content;
    }

    nodes[v.url] = {
      id: idx,
      title: v.data.title || v.fileSlug,
      url: v.url,
      group,
      home: isHome || false,
      outBound: extractLinks(rawContent),
      neighbors: new Set(),
      backLinks: new Set(),
      noteIcon: v.data.noteIcon || process.env.NOTE_ICON_DEFAULT,
      hide: v.data.hideInGraph || false,
    };
    stemURLs[fpath] = v.url;
    if (
      v.data['dg-home'] ||
      (v.data.tags && v.data.tags.indexOf('gardenEntry') > -1)
    ) {
      homeAlias = v.url;
    }
  });
  Object.values(nodes).forEach((node) => {
    const outBound = new Set();
    node.outBound.forEach((olink) => {
      const link = (stemURLs[olink] || olink).split('#')[0];
      outBound.add(link);
    });
    node.outBound = Array.from(outBound);
    node.outBound.forEach((link) => {
      const n = nodes[link];
      if (n) {
        n.neighbors.add(node.url);
        n.backLinks.add(node.url);
        node.neighbors.add(n.url);
        links.push({ source: node.id, target: n.id });
      }
    });
  });
  Object.keys(nodes).map((k) => {
    nodes[k].neighbors = Array.from(nodes[k].neighbors);
    nodes[k].backLinks = Array.from(nodes[k].backLinks);
    nodes[k].size = nodes[k].neighbors.length;
  });
  return {
    homeAlias,
    nodes,
    links,
  };
}

exports.wikiLinkRegex = wikiLinkRegex;
exports.internalLinkRegex = internalLinkRegex;
exports.extractLinks = extractLinks;
exports.getGraph = getGraph;
