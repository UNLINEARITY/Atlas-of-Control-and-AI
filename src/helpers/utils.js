const fs = require('fs');
const matter = require('gray-matter');
const slugify = require('@sindresorhus/slugify');

/**
 * Convert a heading string to a valid HTML ID.
 * Preserve Unicode letters (including CJK) so cross-page heading links remain
 * addressable instead of silently dropping non-Latin characters.
 */
function headerToId(heading) {
  const normalized = String(heading || '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .trim();

  const id = normalized
    // Keep letters and numbers from every Unicode script. Punctuation and
    // whitespace become one separator, producing stable, URL-safe IDs.
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return id || 'heading';
}

// Reimplements the previously published ID algorithm (commit 97725627) so the
// build can map old fragment IDs to new values and stale deep links keep
// resolving after the ID scheme change.
function legacyHeaderToId(heading) {
  const source = String(heading || '');
  const slugified = slugify(source);
  if (slugified) {
    return slugified;
  }
  return source
    .replace(/["""''<>&]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[#?/\\]/g, '')
    .trim();
}

// inputPath -> Map<legacyId, newId>, collected while rendering markdown.
const anchorRedirects = new Map();

// Notes resolve their permalink through directory data (notes.11tydata.js),
// so mirror that lookup with a minimal frontmatter read.
function inputPathToUrl(inputPath) {
  try {
    const file = fs.readFileSync(inputPath, 'utf8');
    const { data } = matter(file);
    if (data.tags && data.tags.indexOf('gardenEntry') != -1) {
      return '/';
    }
    return data.permalink || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Flatten collected per-page maps into { pageUrl: { legacyId: newId } }.
 * Pages without a resolvable permalink are skipped; their old fragments were
 * already dead links and a redirect layer cannot help them.
 */
function getAnchorRedirects() {
  const result = {};
  for (const [inputPath, pageMap] of anchorRedirects) {
    const url = inputPathToUrl(inputPath);
    if (!url) continue;
    const flat = {};
    for (const [legacyId, newId] of pageMap) {
      flat[legacyId] = newId;
    }
    result[url] = flat;
  }
  return result;
}

function namedHeadings(md, state) {
  const ids = {};
  const legacyIds = {};
  let pageKey;

  state.tokens.forEach(function (token, i) {
    if (token.type === 'heading_open') {
      // Extract plain text from heading tokens, stripping any HTML/links
      const inlineToken = state.tokens[i + 1];
      const text = inlineToken.children
        ? inlineToken.children
            .filter(t => t.type === 'text' || t.type === 'code_inline')
            .map(t => t.content)
            .join('')
        : inlineToken.content;
      const id = headerToId(text);
      const uniqId = uncollide(ids, id);
      ids[uniqId] = true;
      setAttr(token, 'id', uniqId);

      // Parallel legacy pass feeds the old→new fragment redirect map.
      const legacyUniqId = uncollide(legacyIds, legacyHeaderToId(text));
      legacyIds[legacyUniqId] = true;
      if (legacyUniqId !== uniqId) {
        pageKey = pageKey || (state.env && state.env.page && state.env.page.inputPath);
        if (pageKey) {
          let pageMap = anchorRedirects.get(pageKey);
          if (!pageMap) {
            pageMap = new Map();
            anchorRedirects.set(pageKey, pageMap);
          }
          pageMap.set(legacyUniqId, uniqId);
        }
      }
    }
  });
}

function uncollide(ids, id) {
  if (!ids[id]) return id;
  let i = 1;
  while (ids[id + '-' + i]) {
    i++;
  }
  return id + '-' + i;
}

function setAttr(token, attr, value, options) {
  const idx = token.attrIndex(attr);

  if (idx === -1) {
    token.attrPush([attr, value]);
  } else if (options && options.append) {
    token.attrs[idx][1] = token.attrs[idx][1] + ' ' + value;
  } else {
    token.attrs[idx][1] = value;
  }
}

//https://github.com/rstacruz/markdown-it-named-headings/blob/master/index.js
exports.namedHeadingsFilter = function (md, options) {
  md.core.ruler.push('named_headings', namedHeadings.bind(null, md));
};

exports.headerToId = headerToId;
exports.getAnchorRedirects = getAnchorRedirects;
