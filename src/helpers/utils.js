const slugify = require('@sindresorhus/slugify');

/**
 * Convert a heading string to a valid HTML ID.
 * Falls back to a sanitized version when slugify returns empty (e.g. CJK text).
 */
function headerToId(heading) {
    const slugifiedHeader = slugify(heading);
    if(slugifiedHeader){
        return slugifiedHeader;
    }
    // Fallback for CJK/unicode text: strip HTML-unsafe chars, replace spaces
    return heading
        .replace(/["""''<>&]/g, '')  // Remove quotes and HTML-unsafe chars
        .replace(/\s+/g, '-')        // Spaces to hyphens
        .replace(/[#?/\\]/g, '')     // Remove URL-unsafe chars
        .trim();
}

function namedHeadings(md, state) {

    const ids = {};

    state.tokens.forEach(function(token, i) {
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
        }
    });
}

function uncollide(ids, id) {
    if (!ids[id]) return id;
    let i = 1;
    while (ids[id + '-' + i]) { i++; }
    return id + '-' + i;
}

function setAttr(token, attr, value, options) {
    const idx = token.attrIndex(attr);

    if (idx === -1) {
        token.attrPush([attr, value]);
    } else if (options && options.append) {
        token.attrs[idx][1] =
            token.attrs[idx][1] + ' ' + value;
    } else {
        token.attrs[idx][1] = value;
    }
}

//https://github.com/rstacruz/markdown-it-named-headings/blob/master/index.js
exports.namedHeadingsFilter = function (md, options) {
    md.core.ruler.push('named_headings', namedHeadings.bind(null, md));
};

exports.headerToId = headerToId;