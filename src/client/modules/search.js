const loadingSvg = `
<svg width="100" height="100" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" stroke="#fff">
  <g fill="none" fill-rule="evenodd" transform="translate(1 1)" stroke-width="2">
    <circle cx="22" cy="22" r="6" stroke-opacity="0">
      <animate attributeName="r" begin="1.5s" dur="3s" values="6;22" calcMode="linear" repeatCount="indefinite" />
      <animate attributeName="stroke-opacity" begin="1.5s" dur="3s" values="1;0" calcMode="linear" repeatCount="indefinite" />
      <animate attributeName="stroke-width" begin="1.5s" dur="3s" values="2;0" calcMode="linear" repeatCount="indefinite" />
    </circle>
    <circle cx="22" cy="22" r="6" stroke-opacity="0">
      <animate attributeName="r" begin="3s" dur="3s" values="6;22" calcMode="linear" repeatCount="indefinite" />
      <animate attributeName="stroke-opacity" begin="3s" dur="3s" values="1;0" calcMode="linear" repeatCount="indefinite" />
      <animate attributeName="stroke-width" begin="3s" dur="3s" values="2;0" calcMode="linear" repeatCount="indefinite" />
    </circle>
    <circle cx="22" cy="22" r="8">
      <animate attributeName="r" begin="0s" dur="1.5s" values="6;1;2;3;4;5;6" calcMode="linear" repeatCount="indefinite" />
    </circle>
  </g>
</svg>`;

function debounce(func, wait) {
  let timeout = null;

  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncate(text, size) {
  const withoutHtml = text.replaceAll(/<[^>]*>/g, '');
  if (withoutHtml.length < size) {
    return withoutHtml;
  }
  return `${withoutHtml.substring(0, size - 3)}...`;
}

function extractSnippets(content, keyword, maxSnippets = 3) {
  const strippedContent = content
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$\n]+\$/g, '')
    .replace(/<[^>]*>/g, '');
  const sentences = strippedContent.split(/(?<=[。！？!?\n])/);
  const snippets = [];
  const lowerKeyword = keyword.toLowerCase();

  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(lowerKeyword)) {
      const highlighted = sentence.replace(new RegExp(escapeRegExp(keyword), 'gi'), (match) => `<mark>${match}</mark>`);
      snippets.push(`... ${highlighted.trim()} ...`);
      if (snippets.length >= maxSnippets) {
        break;
      }
    }
  }

  if (snippets.length === 0) {
    for (const paragraph of strippedContent.split(/\n+/)) {
      if (paragraph.toLowerCase().includes(lowerKeyword)) {
        const highlighted = paragraph.replace(new RegExp(escapeRegExp(keyword), 'gi'), (match) => `<mark>${match}</mark>`);
        snippets.push(`... ${highlighted.trim()} ...`);
        if (snippets.length >= maxSnippets) {
          break;
        }
      }
    }
  }

  return snippets.length > 0 ? snippets : [truncate(strippedContent, 80)];
}

function createIndex(posts) {
  const encoder = (input) => input.toLowerCase().split(/([^a-z]|\P{ASCII})/u);

  const index = new window.FlexSearch.Document({
    cache: true,
    charset: 'latin:extra',
    optimize: true,
    index: [
      {
        field: 'content',
        tokenize: 'reverse',
        encode: encoder,
      },
      {
        field: 'title',
        tokenize: 'forward',
        encode: encoder,
      },
      {
        field: 'tags',
        tokenize: 'forward',
        encode: encoder,
      },
    ],
  });

  posts.forEach((post, id) => {
    index.add({
      id,
      title: post.title,
      content: post.content,
      tags: post.tags,
    });
  });

  return index;
}

function normalizeShortcutLabels() {
  if (navigator.platform.toUpperCase().includes('MAC')) {
    document.querySelectorAll('.search-keys').forEach((element) => {
      element.textContent = '⌘ + K';
    });
  }
}

export function initSearch() {
  const container = document.getElementById('globalsearch');
  if (!container || container.dataset.searchInitialized) {
    return;
  }

  let docs = [];
  let index = null;
  let lastSearch = '';
  const searchIndexDate = container.dataset.searchIndexDate || '';
  const field = container.querySelector('#term');
  const resultsDiv = container.querySelector('#search-results');

  if (!window.FlexSearch?.Document || !field || !resultsDiv) {
    return;
  }

  const toggleSearch = () => {
    const isActive = container.classList.toggle('active');
    if (isActive) {
      field?.focus();
    }
  };

  const offlineSearch = (query) => {
    const isTagSearch = query.startsWith('#') && query.length > 1;
    const searchResults = isTagSearch
      ? index.search(query.substring(1), [{ field: 'tags' }])
      : index.search(query, [
          { field: 'title', limit: 5 },
          { field: 'content', weight: 10 },
        ]);

    const getByField = (fieldName) => {
      const results = searchResults.filter((result) => result.field === fieldName);
      return results.length === 0 ? [] : [...results[0].result];
    };

    const ids = new Set([...getByField('title'), ...getByField('content'), ...getByField('tags')]);
    return [...ids].map((id) => {
      const result = { ...docs[id] };
      const keyword = query.replace(/^#/, '').trim();
      result.tags = result.tags.filter((tag) => tag !== 'gardenEntry' && tag !== 'note');
      result.content = extractSnippets(result.content, keyword).join('<br>');
      return result;
    });
  };

  const search = async () => {
    const value = field?.value.trim();
    if (!value) {
      resultsDiv.innerHTML = '';
      lastSearch = '';
      return;
    }
    if (value === lastSearch || !index) {
      return;
    }

    lastSearch = value;
    resultsDiv.innerHTML = loadingSvg;

    const results = offlineSearch(value);
    if (results.length === 0) {
      resultsDiv.innerHTML = '';
      const empty = document.createElement('p');
      empty.innerText = `No results for "${value}"`;
      resultsDiv.appendChild(empty);
      return;
    }

    const html = results
      .map((result) => {
        const safeTitle = escapeHtml(result.title);
        const safeUrl = encodeURI(result.url);
        const tags = result.tags.length
          ? `<div class="header-meta"><div class="header-tags">${result.tags
              .map((tag) => `<a class="tag" href="JavaScript:Void(0);">#${escapeHtml(tag)}</a>`)
              .join('')}</div></div>`
          : '';

        return `<div class="searchresult">
          <a class="search-link" href="${safeUrl}">${safeTitle}</a>
          <div onclick="window.location='${safeUrl}'">
            ${tags}
            ${result.content}
          </div>
        </div>`;
      })
      .join('');

    resultsDiv.innerHTML = `<div style="max-width:100%;">${html}</div>`;
  };

  const loadIndex = async () => {
    let shouldFetch = true;

    try {
      const cached = localStorage.getItem('searchIndex');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === searchIndexDate && parsed.docs) {
          docs = parsed.docs;
          index = createIndex(docs);
          shouldFetch = false;
        }
      }
    } catch (error) {
      console.warn('Unable to read cached search index.', error);
    }

    if (!shouldFetch) {
      return;
    }

    docs = await (await fetch(`/searchIndex.json?v=${encodeURIComponent(searchIndexDate)}`)).json();
    index = createIndex(docs);

    try {
      localStorage.setItem(
        'searchIndex',
        JSON.stringify({
          date: searchIndexDate,
          docs,
        })
      );
    } catch (error) {
      console.warn('Unable to cache search index.', error);
    }
  };

  window.toggleSearch = toggleSearch;
  window.toggleTagSearch = (element) => {
    const term = element.textContent?.trim();
    if (!term || !field) {
      return;
    }
    field.value = term;
    toggleSearch();
    search();
  };
  window.search = search;

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      toggleSearch();
    }

    if (event.key === 'Escape') {
      container.classList.remove('active');
    }

    if (!container.classList.contains('active')) {
      return;
    }

    const active = document.querySelector('.searchresult.active');

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      active?.classList.remove('active');
      const next = active?.nextElementSibling || document.querySelector('.searchresult');
      next?.classList.add('active');
      next?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      active?.classList.remove('active');
      let next = active?.previousElementSibling;
      if (!next) {
        const items = document.querySelectorAll('.searchresult');
        next = items[items.length - 1];
      }
      next?.classList.add('active');
      next?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }

    if (event.key === 'Enter' && active) {
      event.preventDefault();
      window.location.href = active.querySelector('a')?.href || window.location.href;
    }
  });

  const debouncedSearch = debounce(search, 200);
  field?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      debouncedSearch();
    }
  });

  container.addEventListener('click', (event) => {
    if (event.target === container) {
      toggleSearch();
    }
  });

  const params = new URL(window.location.href).searchParams;
  loadIndex().then(() => {
    if (params.get('q') && field) {
      field.value = params.get('q');
      toggleSearch();
      search();
    }
  });

  normalizeShortcutLabels();
  container.dataset.searchInitialized = 'true';
}
