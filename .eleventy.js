const slugify = require('@sindresorhus/slugify');
const markdownIt = require('markdown-it');
const fs = require('fs');
const matter = require('gray-matter');
const tocPlugin = require('eleventy-plugin-nesting-toc');
const { parse } = require('node-html-parser');
const htmlMinifier = require('html-minifier-terser');
const path = require('path');
const pluginRss = require('@11ty/eleventy-plugin-rss');

const { headerToId, namedHeadingsFilter, getAnchorRedirects } = require('./src/helpers/utils');
const { userMarkdownSetup, userEleventySetup } = require('./src/helpers/userSetup');

const Image = require('@11ty/eleventy-img');

function transformImage(src, cls, alt, sizes, widths = ['500', '700', 'auto']) {
  const options = {
    widths: widths,
    formats: ['webp', 'jpeg'],
    outputDir: './dist/img/optimized',
    urlPath: '/img/optimized',
  };

  // generate images, while this is async we don't wait
  Image(src, options);
  const metadata = Image.statsSync(src, options);
  return metadata;
}

const noteMetadataCache = new Map();
let notePathIndex;

function normalizeNoteKey(value) {
  let normalized = String(value || '');
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Keep the raw value when a note contains an incomplete escape sequence.
  }
  return normalized
    .replace(/^\/+/, '')
    .replace(/^notes\//i, '')
    .replace(/\.(md|markdown)$/i, '')
    .replace(/\\/g, '/')
    .replace(/\/$/, '')
    .trim()
    .toLocaleLowerCase();
}

function buildNotePathIndex() {
  // Process-level memoization: in `--serve` mode newly added or renamed notes
  // are not picked up here until the dev server restarts. Production builds
  // construct the index exactly once, so this is a dev-only limitation.
  if (notePathIndex) return notePathIndex;
  notePathIndex = new Map();
  const notesRoot = path.resolve('./src/site/notes');
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }
      if (!/\.md$/i.test(entry.name)) continue;
      try {
        const parsed = matter(fs.readFileSync(fullPath, 'utf8'));
        const relative = path.relative(notesRoot, fullPath).replace(/\\/g, '/');
        const aliases = Array.isArray(parsed.data.aliases)
          ? parsed.data.aliases
          : typeof parsed.data.aliases === 'string'
            ? [parsed.data.aliases]
            : [];
        [
          relative,
          relative.replace(/\.md$/i, ''),
          path.basename(relative, '.md'),
          parsed.data.title,
          parsed.data.permalink,
          parsed.data['dg-path'],
          ...aliases,
        ]
          .filter(Boolean)
          .forEach(key => {
            const normalizedKey = normalizeNoteKey(key);
            const existing = notePathIndex.get(normalizedKey);
            if (existing && existing !== fullPath) {
              console.warn(
                `[notes] Ambiguous link key "${key}" matches both ${existing} and ${fullPath}; keeping the first.`
              );
              return;
            }
            notePathIndex.set(normalizedKey, fullPath);
          });
      } catch {
        // Ignore malformed notes; Eleventy will report them during rendering.
      }
    }
  };
  visit(notesRoot);
  return notePathIndex;
}

function resolveNoteFile(fileName) {
  const direct = path.resolve(
    './src/site/notes',
    fileName.endsWith('.md') ? fileName : `${fileName}.md`
  );
  if (fs.existsSync(direct)) return direct;
  return buildNotePathIndex().get(normalizeNoteKey(fileName));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getAnchorLink(filePath, linkTitle) {
  const { attributes, innerHTML } = getAnchorAttributes(filePath, linkTitle);
  return `<a ${Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ')}>${innerHTML}</a>`;
}

function getAnchorAttributes(filePath, linkTitle) {
  const fileName = filePath.replaceAll('&amp;', '&');
  let headerLinkPath = '';
  if (filePath.includes('#')) {
    const header = filePath.split('#')[1];
    headerLinkPath = `#${headerToId(header)}`;
  }
  const title = escapeHtml(linkTitle ? linkTitle : fileName);
  const notePath = fileName.split('#')[0];
  // Dead links have no resolvable file, so they are cached under a key derived
  // from the requested name; the fullPath cache below only ever holds hits.
  const deadLinkKey = `unresolved:${normalizeNoteKey(notePath)}`;

  // Use a consistent cache key that is the full path to the note file
  const fullPath = resolveNoteFile(notePath);

  // 1. Check cache first
  if (noteMetadataCache.has(deadLinkKey)) {
    return {
      attributes: { class: 'internal-link is-unresolved', href: '/404', target: '' },
      innerHTML: title,
    };
  }
  if (fullPath && noteMetadataCache.has(fullPath)) {
    const cached = noteMetadataCache.get(fullPath);
    if (cached.deadLink) {
      return {
        attributes: { class: 'internal-link is-unresolved', href: '/404', target: '' },
        innerHTML: title,
      };
    }
    return {
      attributes: {
        ...cached.attributes,
        href: `${cached.attributes.href}${headerLinkPath}`,
      },
      innerHTML: title,
    };
  }

  // 2. If not in cache, read file and compute attributes
  let noteIcon = process.env.NOTE_ICON_DEFAULT;
  let permalink = `/notes/${slugify(filePath)}`;
  let deadLink = false;
  try {
    if (!fullPath) throw new Error('Note not found');
    const file = fs.readFileSync(fullPath, 'utf8');
    const frontMatter = matter(file);
    if (frontMatter.data.permalink) {
      permalink = frontMatter.data.permalink;
    }
    if (frontMatter.data.tags && frontMatter.data.tags.indexOf('gardenEntry') != -1) {
      permalink = '/';
    }
    if (frontMatter.data.noteIcon) {
      noteIcon = frontMatter.data.noteIcon;
    }
  } catch {
    deadLink = true;
  }

  // 3. Store result in cache and return
  if (deadLink) {
    noteMetadataCache.set(deadLinkKey, { deadLink: true });
    return {
      attributes: { class: 'internal-link is-unresolved', href: '/404', target: '' },
      innerHTML: title,
    };
  }

  const computedAttributes = {
    class: 'internal-link',
    target: '',
    'data-note-icon': noteIcon,
    href: permalink, // Store base permalink, append header path later
  };

  noteMetadataCache.set(fullPath, { attributes: computedAttributes });

  return {
    attributes: {
      ...computedAttributes,
      href: `${permalink}${headerLinkPath}`,
    },
    innerHTML: title,
  };
}

const tagRegex = /(^|\s|>)(#[^\s!@#$%^&*()=+.,[{\]};:'"?><]+)(?!([^<]*>))/g;

function replaceWikiLinksOutsideTags(value, replacer) {
  // Heading IDs and other attributes may contain literal wiki-link syntax.
  // Restrict replacements to text nodes so generated HTML stays valid.
  return String(value || '').replace(
    /(<[^>]*>)|(\[\[(.*?\|.*?)\]\])/gs,
    (match, tag, _wiki, payload) => {
      return tag ? tag : replacer(match, payload);
    }
  );
}

function toFeedSummary(value, maxLength = 600) {
  const text = String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\[([^\]|]+)(?:\\?\|([^\]]+))?\]\]/g, (_, target, label) => label || target)
    .replace(/[*_~`]+/g, '')
    .replace(/\${1,2}[^$]+\${1,2}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
  });
  const markdownLib = markdownIt({
    breaks: true,
    html: true,
    linkify: true,
  })
    .use(require('markdown-it-anchor'), {
      slugify: headerToId,
    })
    .use(require('markdown-it-mark'))
    .use(require('markdown-it-footnote'))
    .use(function (md) {
      md.renderer.rules.hashtag_open = function (tokens, idx) {
        return '<a class="tag" onclick="toggleTagSearch(this)">';
      };
    })
    .use(require('markdown-it-mathjax3'), {
      tex: {
        inlineMath: [['$', '$']],
      },
      options: {
        skipHtmlTags: { '[-]': ['pre'] },
      },
    })
    .use(require('markdown-it-attrs'))
    .use(require('markdown-it-task-checkbox'), {
      disabled: true,
      divWrap: false,
      divClass: 'checkbox',
      idPrefix: 'cbx_',
      ulClass: 'task-list',
      liClass: 'task-list-item',
    })
    .use(require('markdown-it-plantuml'), {
      openMarker: '```plantuml',
      closeMarker: '```',
    })
    .use(namedHeadingsFilter)
    .use(function (md) {
      //https://github.com/DCsunset/markdown-it-mermaid-plugin
      const origFenceRule =
        md.renderer.rules.fence ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        if (token.info === 'mermaid') {
          const code = token.content.trim();
          return `<pre class="mermaid">${code}</pre>`;
        }
        if (token.info === 'transclusion') {
          const code = token.content.trim();
          return `<div class="transclusion">${md.render(code)}</div>`;
        }
        if (token.info.startsWith('ad-')) {
          const code = token.content.trim();
          const parts = code.split('\n');
          let titleLine;
          let collapse;
          let collapsible = false;
          let collapsed = true;
          let icon;
          let color;
          let nbLinesToSkip = 0;
          for (let i = 0; i < 4; i++) {
            if (parts[i] && parts[i].trim()) {
              const line = parts[i] && parts[i].trim().toLowerCase();
              if (line.startsWith('title:')) {
                titleLine = line.substring(6);
                nbLinesToSkip++;
              } else if (line.startsWith('icon:')) {
                // icon = line.substring(5);
                nbLinesToSkip++;
              } else if (line.startsWith('collapse:')) {
                collapsible = true;
                collapse = line.substring(9);
                if (collapse && collapse.trim().toLowerCase() === 'open') {
                  collapsed = false;
                }
                nbLinesToSkip++;
              } else if (line.startsWith('color:')) {
                // color = line.substring(6);
                nbLinesToSkip++;
              }
            }
          }
          const foldDiv = collapsible
            ? `<div class="callout-fold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-chevron-down">
              <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          </div>`
            : '';
          const titleDiv = titleLine
            ? `<div class="callout-title"><div class="callout-title-inner">${titleLine}</div>${foldDiv}</div>`
            : '';
          let collapseClasses = titleLine && collapsible ? 'is-collapsible' : '';
          if (collapsible && collapsed) {
            collapseClasses += ' is-collapsed';
          }

          const res = `<div data-callout-metadata class="callout ${collapseClasses}" data-callout="${token.info.substring(3)}
            ">${titleDiv}\n<div class="callout-content">${md.render(
              parts.slice(nbLinesToSkip).join('\n')
            )}</div></div>`;
          return res;
        }

        const langName = token.info.split(' ')[0] || 'unknown';
        const originalFenceRule = origFenceRule(tokens, idx, options, env, slf);

        return `<div class="code-block-wrapper">
                    <div class="code-block-header">
                        <span class="language">${langName}</span>
                        <button class="copy-code-button" aria-label="Copy code to clipboard">
                            Copy
                        </button>
                    </div>
                    ${originalFenceRule}
                </div>`;
      };

      const defaultImageRule =
        md.renderer.rules.image ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const src = token.attrGet('src');

        if (src && !src.startsWith('/') && !src.startsWith('http')) {
          const pagePath = env.page.inputPath;
          const resolvedImagePath = path.resolve(path.dirname(pagePath), src);
          const siteRoot = path.resolve('./src/site');
          const newSrc = '/' + path.relative(siteRoot, resolvedImagePath).replace(/\\/g, '/');
          token.attrSet('src', newSrc);
        }

        const imageName = tokens[idx].content;
        //"image.png|metadata?|width"
        const [, ...widthAndMetaData] = imageName.split('|');
        const lastValue = widthAndMetaData[widthAndMetaData.length - 1];
        const lastValueIsNumber = !isNaN(lastValue);
        const width = lastValueIsNumber ? lastValue : null;

        let metaData = '';
        if (widthAndMetaData.length > 1) {
          metaData = widthAndMetaData.slice(0, widthAndMetaData.length - 1).join(' ');
        }

        if (!lastValueIsNumber) {
          // Append lastValue to metaData if it's not a number
          // metaData += ` ${lastValue}`;
        }

        if (width) {
          const widthIndex = tokens[idx].attrIndex('width');
          const widthAttr = `${width}px`;
          if (widthIndex < 0) {
            tokens[idx].attrPush(['width', widthAttr]);
          } else {
            tokens[idx].attrs[widthIndex][1] = widthAttr;
          }
        }

        // 添加懒加载和异步解码属性
        const loadingIndex = tokens[idx].attrIndex('loading');
        if (loadingIndex < 0) {
          tokens[idx].attrPush(['loading', 'lazy']);
        }

        const decodingIndex = tokens[idx].attrIndex('decoding');
        if (decodingIndex < 0) {
          tokens[idx].attrPush(['decoding', 'async']);
        }

        return defaultImageRule(tokens, idx, options, env, self);
      };

      const defaultLinkRule =
        md.renderer.rules.link_open ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const aIndex = tokens[idx].attrIndex('target');
        const classIndex = tokens[idx].attrIndex('class');

        if (aIndex < 0) {
          tokens[idx].attrPush(['target', '_blank']);
        } else {
          tokens[idx].attrs[aIndex][1] = '_blank';
        }

        if (classIndex < 0) {
          tokens[idx].attrPush(['class', 'external-link']);
        } else {
          tokens[idx].attrs[classIndex][1] = 'external-link';
        }

        const relIndex = tokens[idx].attrIndex('rel');
        if (relIndex < 0) {
          tokens[idx].attrPush(['rel', 'noopener noreferrer']);
        } else if (!tokens[idx].attrs[relIndex][1].includes('noopener')) {
          tokens[idx].attrs[relIndex][1] += ' noopener noreferrer';
        }

        return defaultLinkRule(tokens, idx, options, env, self);
      };
    })
    .use(userMarkdownSetup);

  eleventyConfig.setLibrary('md', markdownLib);

  eleventyConfig.addFilter('isoDate', function (date) {
    return date && date.toISOString();
  });

  eleventyConfig.addFilter('link', function (str) {
    return (
      str &&
      replaceWikiLinksOutsideTags(str, function (match, p1) {
        //Check if it is an embedded excalidraw drawing or mathjax javascript
        if (p1.indexOf('],[') > -1 || p1.indexOf('"$"') > -1) {
          return match;
        }
        const [fileLink, linkTitle] = p1.split('|');

        return getAnchorLink(fileLink, linkTitle);
      })
    );
  });

  eleventyConfig.addFilter('taggify', function (str) {
    return (
      str &&
      str.replace(tagRegex, function (match, precede, tag) {
        return `${precede}<a class="tag" onclick="toggleTagSearch(this)" data-content="${tag}">${tag}</a>`;
      })
    );
  });

  eleventyConfig.addFilter('searchableTags', function (str) {
    let tags;
    const match = str && str.match(tagRegex);
    if (match) {
      tags = match
        .map(m => {
          return `"${m.split('#')[1]}"`;
        })
        .join(', ');
    }
    if (tags) {
      return `${tags},`;
    } else {
      return '';
    }
  });

  eleventyConfig.addFilter('hideDataview', function (str) {
    return (
      str &&
      str.replace(/\(\S+::(.*)\)/g, function (_, value) {
        return value.trim();
      })
    );
  });

  eleventyConfig.addFilter('feedSummary', toFeedSummary);

  eleventyConfig.addTransform('dataview-js-links', function (str) {
    const parsed = parse(str);
    for (const dataViewJsLink of parsed.querySelectorAll('a[data-href].internal-link')) {
      const notePath = dataViewJsLink.getAttribute('data-href');
      const title = dataViewJsLink.innerHTML;
      const { attributes, innerHTML } = getAnchorAttributes(notePath, title);
      for (const key in attributes) {
        dataViewJsLink.setAttribute(key, attributes[key]);
      }
      dataViewJsLink.innerHTML = innerHTML;
    }

    return str && parsed.innerHTML;
  });

  eleventyConfig.addTransform('callout-block', function (str) {
    const parsed = parse(str);

    const transformCalloutBlocks = (blockquotes = parsed.querySelectorAll('blockquote')) => {
      for (const blockquote of blockquotes) {
        transformCalloutBlocks(blockquote.querySelectorAll('blockquote'));

        let content = blockquote.innerHTML;

        let titleDiv = '';
        let calloutType = '';
        let calloutMetaData = '';
        let isCollapsable;
        let isCollapsed;
        const calloutMeta = /\[!([\w-]*)\|?(\s?.*)\]([+-])?(\s?.*)/;
        if (!content.match(calloutMeta)) {
          continue;
        }

        content = content.replace(
          calloutMeta,
          function (metaInfoMatch, callout, metaData, collapse, title) {
            isCollapsable = Boolean(collapse);
            isCollapsed = collapse === '-';
            const titleText = title.replace(/(<\/{0,1}\w+>)/, '')
              ? title
              : `${callout.charAt(0).toUpperCase()}${callout.substring(1).toLowerCase()}`;
            const fold = isCollapsable
              ? `<div class="callout-fold"><i icon-name="chevron-down"></i></div>`
              : ``;

            calloutType = callout;
            calloutMetaData = metaData;
            titleDiv = `<div class="callout-title"><div class="callout-title-inner">${titleText}</div>${fold}</div>`;
            return '';
          }
        );

        /* Hacky fix for callouts with only a title:
        This will ensure callout-content isn't produced if
        the callout only has a title, like this:
        ```md
        > [!info] i only have a title
        ```
        Not sure why content has a random <p> tag in it,
        */
        if (content === '\n<p>\n') {
          content = '';
        }
        const contentDiv = content ? `\n<div class="callout-content">${content}</div>` : '';

        blockquote.tagName = 'div';
        blockquote.classList.add('callout');
        blockquote.classList.add(isCollapsable ? 'is-collapsible' : '');
        blockquote.classList.add(isCollapsed ? 'is-collapsed' : '');
        blockquote.setAttribute('data-callout', calloutType.toLowerCase());
        calloutMetaData && blockquote.setAttribute('data-callout-metadata', calloutMetaData);
        blockquote.innerHTML = `${titleDiv}${contentDiv}`;
      }
    };

    transformCalloutBlocks();

    return str && parsed.innerHTML;
  });

  function fillPictureSourceSets(src, cls, alt, meta, width, imageTag) {
    imageTag.tagName = 'picture';

    // 获取图片原始尺寸用于CLS预防
    const originalWidth = width || (meta.jpeg && meta.jpeg[0] && meta.jpeg[0].width) || 'auto';
    const originalHeight = (meta.jpeg && meta.jpeg[0] && meta.jpeg[0].height) || 'auto';

    let html = `<source
      media="(max-width:480px)"
      srcset="${meta.webp[0].url}"
      type="image/webp"
      />
      <source
      media="(max-width:480px)"
      srcset="${meta.jpeg[0].url}"
      />
      `;
    if (meta.webp && meta.webp[1] && meta.webp[1].url) {
      html += `<source
        media="(max-width:1920px)"
        srcset="${meta.webp[1].url}"
        type="image/webp"
        />`;
    }
    if (meta.jpeg && meta.jpeg[1] && meta.jpeg[1].url) {
      html += `<source
        media="(max-width:1920px)"
        srcset="${meta.jpeg[1].url}"
        />`;
    }
    html += `<img
      class="${cls.toString()}"
      src="${src}"
      alt="${alt}"
      width="${originalWidth}"
      height="${originalHeight}"
      loading="lazy"
      decoding="async"
      />`;
    imageTag.innerHTML = html;
  }

  eleventyConfig.addTransform('picture', function (str, contentPath) {
    if (process.env.USE_FULL_RESOLUTION_IMAGES === 'true') {
      return str;
    }
    const parsed = parse(str);
    for (const imageTag of parsed.querySelectorAll('.cm-s-obsidian img')) {
      const src = imageTag.getAttribute('src');
      if (src && src.startsWith('/') && !src.endsWith('.svg')) {
        const cls = imageTag.classList.value;
        const alt = imageTag.getAttribute('alt');
        const width = imageTag.getAttribute('width') || '';

        try {
          const meta = transformImage(
            path.join(path.dirname(contentPath), decodeURI(src)),
            cls.toString(),
            alt,
            ['(max-width: 480px)', '(max-width: 1024px)']
          );

          if (meta) {
            fillPictureSourceSets(src, cls, alt, meta, width, imageTag);
          }
        } catch {
          // Make it fault tolarent.
        }
      }
    }
    return str && parsed.innerHTML;
  });

  eleventyConfig.addTransform('table', function (str) {
    const parsed = parse(str);
    for (const t of parsed.querySelectorAll('.cm-s-obsidian > table')) {
      const inner = t.innerHTML;
      t.tagName = 'div';
      t.classList.add('table-wrapper');
      t.innerHTML = `<table>${inner}</table>`;
    }

    for (const t of parsed.querySelectorAll('.cm-s-obsidian > .block-language-dataview > table')) {
      t.classList.add('dataview');
      t.classList.add('table-view-table');
      t.querySelector('thead')?.classList.add('table-view-thead');
      t.querySelector('tbody')?.classList.add('table-view-tbody');
      t.querySelectorAll('thead > tr')?.forEach(tr => {
        tr.classList.add('table-view-tr-header');
      });
      t.querySelectorAll('thead > tr > th')?.forEach(th => {
        th.classList.add('table-view-th');
      });
    }
    return str && parsed.innerHTML;
  });

  eleventyConfig.addTransform('htmlMinifier', async (content, outputPath) => {
    if (
      (process.env.NODE_ENV === 'production' || process.env.ELEVENTY_ENV === 'prod') &&
      outputPath &&
      outputPath.endsWith('.html')
    ) {
      try {
        return await htmlMinifier.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          preserveLineBreaks: true,
          minifyCSS: true,
          minifyJS: true,
          keepClosingSlash: true,
        });
      } catch (e) {
        console.warn(`[htmlMinifier] Skipping ${outputPath}: ${e.message}`);
        return content;
      }
    }
    return content;
  });

  eleventyConfig.addPassthroughCopy('src/site/favicon.svg');
  eleventyConfig.addPassthroughCopy('src/site/img');
  eleventyConfig.addPassthroughCopy('src/site/scripts');
  eleventyConfig.addPassthroughCopy('src/site/vendor');
  eleventyConfig.addPassthroughCopy('src/site/styles/_theme.*.css');
  eleventyConfig.addPassthroughCopy('src/site/styles/lazy-loading.css');
  eleventyConfig.addPassthroughCopy({ 'src/site/manifest.json': '/manifest.json' });
  eleventyConfig.addPassthroughCopy({ 'src/site/sw.js': '/sw.js' });
  eleventyConfig.addPassthroughCopy('src/site/robots.txt');
  eleventyConfig.addPassthroughCopy('browserconfig.xml');
  eleventyConfig.addPlugin(tocPlugin, {
    ul: true,
    tags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  });

  eleventyConfig.addFilter('dateToZulu', function (date) {
    try {
      return new Date(date).toISOString('dd-MM-yyyyTHH:mm:ssZ');
    } catch {
      return '';
    }
  });

  eleventyConfig.addFilter('date', function (date) {
    try {
      return new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
    } catch {
      return '';
    }
  });

  eleventyConfig.addFilter('jsonify', function (variable) {
    return JSON.stringify(variable) || '""';
  });

  eleventyConfig.addPlugin(pluginRss, {
    posthtmlRenderOptions: {
      closingSingleTag: 'slash',
      singleTags: ['link'],
    },
  });

  // Publish the legacy→new heading ID redirect map built up during markdown
  // rendering so the client can recover stale deep links (#old-id URLs).
  eleventyConfig.on('eleventy.after', () => {
    const redirects = getAnchorRedirects();
    if (Object.keys(redirects).length > 0) {
      fs.mkdirSync('./dist', { recursive: true });
      fs.writeFileSync('./dist/anchorRedirects.json', JSON.stringify(redirects));
    }
  });

  userEleventySetup(eleventyConfig);

  return {
    dir: {
      input: 'src/site',
      output: 'dist',
      data: `_data`,
    },
    templateFormats: ['njk', 'md', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: false,
    passthroughFileCopy: true,
  };
};
