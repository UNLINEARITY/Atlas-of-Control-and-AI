import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext';
import { refreshIcons } from './modules/icons.js';

const LABEL_LAYOUT_CACHE = new Map();
const GRAPH_MODE_PRETEXT = 'pretext';
const GRAPH_MODE_NATIVE = 'native';
const GRAPH_LABEL_FONT = '400 3.5px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif';
const GRAPH_LABEL_LINE_HEIGHT = 4.75;
const GRAPH_LABEL_LINE_LIMIT = 3;

function htmlDecode(input) {
  const parser = new DOMParser().parseFromString(input, 'text/html');
  return parser.documentElement.textContent || '';
}

function getCssVar(variable) {
  return getComputedStyle(document.body).getPropertyValue(variable);
}

function getNodeColorByPath(dgPath, defaultColor) {
  if (!dgPath) {
    return defaultColor;
  }
  if (dgPath.includes('代数')) {
    return '#F59E0B';
  }
  if (dgPath.includes('机器人')) {
    return '#84CC16';
  }
  if (dgPath.includes('过程控制')) {
    return '#9A4E90';
  }
  if (dgPath.includes('智能')) {
    return '#FF0000';
  }
  if (dgPath.includes('控制')) {
    return '#7496ff';
  }
  if (dgPath.includes('数学')) {
    return '#c44f70';
  }
  return defaultColor;
}

function getLabelLines(label, mode, maxWidth) {
  if (!label) {
    return [];
  }

  if (mode !== GRAPH_MODE_PRETEXT) {
    return [label];
  }

  const cacheKey = `${mode}::${GRAPH_LABEL_FONT}::${maxWidth}::${label}`;
  if (LABEL_LAYOUT_CACHE.has(cacheKey)) {
    return LABEL_LAYOUT_CACHE.get(cacheKey);
  }

  try {
    const prepared = prepareWithSegments(label, GRAPH_LABEL_FONT);
    const { lines } = layoutWithLines(prepared, maxWidth, GRAPH_LABEL_LINE_HEIGHT);
    const normalized = lines.map((line) => line.text.trim()).filter(Boolean);
    const limited =
      normalized.length > GRAPH_LABEL_LINE_LIMIT
        ? [
            ...normalized.slice(0, GRAPH_LABEL_LINE_LIMIT - 1),
            `${normalized[GRAPH_LABEL_LINE_LIMIT - 1]}…`,
          ]
        : normalized;
    LABEL_LAYOUT_CACHE.set(cacheKey, limited);
    return limited;
  } catch (error) {
    console.warn('Pretext label layout failed, falling back to native labels.', error);
    LABEL_LAYOUT_CACHE.set(cacheKey, [label]);
    return [label];
  }
}

function drawNodeLabel(ctx, node, nodeRadius, layoutMode) {
  const label = htmlDecode(node.title);
  if (!label) {
    return;
  }

  const maxWidth = node.current ? 64 : 52;
  const lines = getLabelLines(label, layoutMode, maxWidth);
  if (lines.length === 0) {
    return;
  }

  ctx.font = GRAPH_LABEL_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const startY = node.y + nodeRadius + 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, node.x, startY + index * GRAPH_LABEL_LINE_HEIGHT);
  });
}

function destroyGraphAtElement(element) {
  if (!element) {
    return;
  }

  if (element.__graphResizeObserver) {
    element.__graphResizeObserver.disconnect();
    element.__graphResizeObserver = null;
  }

  if (element.__graphResizeHandler) {
    window.removeEventListener('resize', element.__graphResizeHandler);
    element.__graphResizeHandler = null;
  }

  if (element.__graphFitTimer) {
    window.clearTimeout(element.__graphFitTimer);
    element.__graphFitTimer = null;
  }

  if (element.__graphInstance && typeof element.__graphInstance._destructor === 'function') {
    element.__graphInstance._destructor();
  }

  element.__graphInstance = null;
  element.removeAttribute('data-graph-state');
  element.replaceChildren();
}

function getNextLevelNeighbours(existing, remaining) {
  const neighborKeys = Object.values(existing)
    .map((node) => node.neighbors)
    .flat();
  const nextRemaining = Object.keys(remaining).reduce((accumulator, key) => {
    if (neighborKeys.includes(key)) {
      if (!remaining[key].hide) {
        existing[key] = remaining[key];
      }
    } else {
      accumulator[key] = remaining[key];
    }

    return accumulator;
  }, {});

  return [existing, nextRemaining];
}

function filterLocalGraphData(graphData, depth) {
  if (graphData == null) {
    return null;
  }

  let remaining = JSON.parse(JSON.stringify(graphData.nodes));
  const links = JSON.parse(JSON.stringify(graphData.links));
  const currentLink = decodeURI(window.location.pathname);
  const currentNode = remaining[currentLink] || Object.values(remaining).find((value) => value.home);

  delete remaining[currentNode.url];
  if (!currentNode.home) {
    const home = Object.values(remaining).find((value) => value.home);
    delete remaining[home.url];
  }

  currentNode.current = true;
  let existing = {
    [currentNode.url]: currentNode,
  };

  for (let index = 0; index < depth; index += 1) {
    [existing, remaining] = getNextLevelNeighbours(existing, remaining);
  }

  let nodes = Object.values(existing);
  if (!currentNode.home) {
    nodes = nodes.filter((node) => !node.home);
  }

  const ids = nodes.map((node) => node.id);
  return {
    nodes,
    links: links.filter((link) => ids.includes(link.target) && ids.includes(link.source)),
  };
}

function filterFullGraphData(graphData) {
  if (graphData == null) {
    return null;
  }

  const cloned = JSON.parse(JSON.stringify(graphData));
  const hiddenIds = Object.values(cloned.nodes)
    .filter((node) => node.hide)
    .map((node) => node.id);

  return {
    links: JSON.parse(JSON.stringify(cloned.links)).filter(
      (link) => !hiddenIds.includes(link.source) && !hiddenIds.includes(link.target)
    ),
    nodes: [...Object.values(cloned.nodes).filter((node) => !node.hide)],
  };
}

async function fetchGraphData() {
  const graphData = await fetch('/graph.json').then((response) => response.json());
  return {
    graphData,
    fullGraphData: filterFullGraphData(graphData),
  };
}

function renderGraph(graphData, element, options = {}) {
  if (graphData == null || !element) {
    return null;
  }

  const {
    fitDelay = null,
    layoutMode = GRAPH_MODE_NATIVE,
    rootElement = element.closest('[data-graph-label-layout]'),
  } = options;
  destroyGraphAtElement(element);

  element.setAttribute('data-graph-state', 'rendering');
  const isFullGraph = element.id === 'full-graph-container';
  const shouldFitToPanel = !isFullGraph;

  const zoomGraphToFit = (graph, wait = 180) => {
    if (!shouldFitToPanel || !graph) {
      return;
    }

    window.clearTimeout(element.__graphFitTimer);
    element.__graphFitTimer = window.setTimeout(() => {
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {
        graph.zoomToFit(10, 32);
      }
    }, wait);
  };

  let resizeFrame = null;
  const getContainerHeight = () => {
    if (element.id !== 'link-graph' || !element.parentElement) {
      return element.offsetHeight;
    }

    const parent = element.parentElement;
    const siblingHeight = [...parent.children]
      .filter((child) => child !== element)
      .reduce((total, child) => total + child.offsetHeight, 0);

    return Math.max(parent.clientHeight - siblingHeight, 0);
  };

  let graph = null;
  const syncGraphSize = () => {
    resizeFrame = null;
    if (!graph || !element.isConnected) {
      return;
    }

    const nextWidth = element.offsetWidth;
    const nextHeight = getContainerHeight();
    if (nextWidth <= 0 || nextHeight <= 0) {
      return;
    }

    if (element.id === 'link-graph') {
      element.style.height = `${nextHeight}px`;
    }

    graph.width(nextWidth);
    graph.height(nextHeight);
    zoomGraphToFit(graph, 120);
  };

  const queueGraphResize = () => {
    if (resizeFrame !== null) {
      return;
    }
    resizeFrame = requestAnimationFrame(syncGraphSize);
  };

  const resizeObserver = new ResizeObserver(() => {
    queueGraphResize();
  });
  resizeObserver.observe(element);
  if (element.id === 'link-graph' && element.parentElement) {
    resizeObserver.observe(element.parentElement);
  }
  element.__graphResizeObserver = resizeObserver;

  const onResize = () => {
    queueGraphResize();
  };
  window.addEventListener('resize', onResize);
  element.__graphResizeHandler = onResize;

  if (element.id === 'link-graph') {
    const initialHeight = getContainerHeight();
    if (initialHeight > 0) {
      element.style.height = `${initialHeight}px`;
    }
  }

  const width = element.offsetWidth;
  const height = element.id === 'link-graph' ? getContainerHeight() : element.offsetHeight;
  const highlightNodes = new Set();
  let hoverNode = null;
  const selectedNodes = new Set();
  const nodeMap = Object.fromEntries(graphData.nodes.map((node) => [node.url, node]));

  const color = getCssVar('--graph-main');
  const mutedColor = getCssVar('--graph-muted');
  const layoutKey = `graph-layout-${element.id}`;
  let savedLayout = {};
  try {
    savedLayout = JSON.parse(localStorage.getItem(layoutKey) || '{}');
  } catch {
    savedLayout = {};
  }

  const linkCurvature = 0.4;
  const linksByPair = {};
  graphData.links.forEach((link) => {
    const source = typeof link.source === 'object' ? link.source.id : link.source;
    const target = typeof link.target === 'object' ? link.target.id : link.target;
    const pairKey = [source, target].sort().join('-');
    if (!linksByPair[pairKey]) {
      linksByPair[pairKey] = [];
    }
    linksByPair[pairKey].push(link);
  });

  Object.values(linksByPair).forEach((linksInPair) => {
    if (linksInPair.length > 1) {
      const [first, second] = linksInPair;
      const firstSource = typeof first.source === 'object' ? first.source.id : first.source;
      const secondSource = typeof second.source === 'object' ? second.source.id : second.source;

      if (firstSource === secondSource) {
        first.curvature = linkCurvature;
        second.curvature = -linkCurvature;
      } else {
        first.curvature = linkCurvature;
        second.curvature = linkCurvature;
      }
    } else {
      linksInPair.forEach((link) => {
        link.curvature = 0;
      });
    }
  });

  if (isFullGraph && savedLayout && graphData?.nodes) {
    graphData.nodes.forEach((node) => {
      if (savedLayout[node.id]) {
        node.x = savedLayout[node.id].x;
        node.y = savedLayout[node.id].y;
        node.fx = savedLayout[node.id].fx;
        node.fy = savedLayout[node.id].fy;
      }
    });
  }

  graph = window
    .ForceGraph()(element)
    .graphData(graphData)
    .nodeId('id')
    .nodeLabel('title')
    .linkSource('source')
    .linkTarget('target')
    .linkCurvature('curvature')
    .d3AlphaDecay(0.1)
    .width(width)
    .height(height)
    .linkDirectionalArrowLength(2)
    .linkDirectionalArrowRelPos(0.5)
    .autoPauseRedraw(false)
    .linkColor((link) => {
      const defaultLinkColor = isFullGraph ? mutedColor : color;
      const sourceUrl = link.source.url;
      const targetUrl = link.target.url;
      const primaryHighlightUrls = new Set();

      if (hoverNode) {
        primaryHighlightUrls.add(hoverNode.url);
      }
      selectedNodes.forEach((url) => primaryHighlightUrls.add(url));

      if (primaryHighlightUrls.size === 0) {
        return defaultLinkColor;
      }

      return primaryHighlightUrls.has(sourceUrl) || primaryHighlightUrls.has(targetUrl) ? color : mutedColor;
    })
    .nodeCanvasObject((node, ctx) => {
      const numberOfNeighbours = (node.neighbors && node.neighbors.length) || 2;
      const nodeRadius = Math.min(7, Math.max(numberOfNeighbours / 2, 2));

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);

      const nodeColor = getNodeColorByPath(node.url, color);
      const isHovered = highlightNodes.has(node.url);
      let isHighlighted;

      if (selectedNodes.size > 0) {
        const selectionHighlights = new Set();
        selectedNodes.forEach((selectedUrl) => {
          selectionHighlights.add(selectedUrl);
          const selectedNode = nodeMap[selectedUrl];
          selectedNode?.neighbors?.forEach((neighborUrl) => selectionHighlights.add(neighborUrl));
        });
        isHighlighted = selectionHighlights.has(node.url) || isHovered;
      } else {
        isHighlighted = hoverNode == null || isHovered;
      }

      ctx.fillStyle = isHighlighted ? nodeColor : mutedColor;
      ctx.fill();

      if (selectedNodes.has(node.url)) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + 2, 0, 2 * Math.PI, false);
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.stroke();
      }

      if (node.current) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + 1, 0, 2 * Math.PI, false);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = color;
        ctx.stroke();
      }

      drawNodeLabel(ctx, node, nodeRadius, layoutMode);
    })
    .onNodeClick((node) => {
      window.location = node.url;
    })
    .onNodeRightClick((node) => {
      if (selectedNodes.has(node.url)) {
        selectedNodes.delete(node.url);
      } else {
        selectedNodes.add(node.url);
      }
      return false;
    })
    .onNodeHover((node) => {
      highlightNodes.clear();
      if (node) {
        highlightNodes.add(node.url);
        node.neighbors.forEach((neighborUrl) => highlightNodes.add(neighborUrl));
      }
      hoverNode = node || null;
    })
    .onNodeDragEnd(() => {
      if (!isFullGraph) {
        return;
      }

      const layout = {};
      graphData.nodes.forEach((node) => {
        layout[node.id] = {
          x: node.x,
          y: node.y,
          fx: node.fx,
          fy: node.fy,
        };
      });
      localStorage.setItem(layoutKey, JSON.stringify(layout));
    });

  if (isFullGraph) {
    graph.d3Force('link').distance(10);
    graph.d3Force('charge').strength(-60);
  }

  if (fitDelay != null && graphData.nodes.length > 4) {
    window.setTimeout(() => {
      graph.zoomToFit(5, 75);
    }, fitDelay);
  }

  if (shouldFitToPanel && graphData.nodes.length > 1) {
    zoomGraphToFit(graph, 160);
    zoomGraphToFit(graph, 900);
  }

  element.__graphInstance = graph;
  queueGraphResize();
  requestAnimationFrame(() => {
    if (element.__graphInstance === graph) {
      element.setAttribute('data-graph-state', 'ready');
    }
  });

  if (rootElement?.dataset.graphLabelLayout === GRAPH_MODE_PRETEXT) {
    rootElement.dataset.graphLabelStatus = 'active';
  } else {
    rootElement?.removeAttribute('data-graph-label-status');
  }

  return graph;
}

function createComponentState() {
  return {
    depth: 1,
    depthCommitTimer: null,
    fullGraph: null,
    fullGraphData: null,
    fullScreen: false,
    graph: null,
    graphData: null,
    graphLabelLayout: GRAPH_MODE_NATIVE,
    showFullGraph: false,
    sliderDepth: 1,

    async initialize(rootElement) {
      this.graphLabelLayout = rootElement.dataset.graphLabelLayout || GRAPH_MODE_NATIVE;
      const { graphData, fullGraphData } = await fetchGraphData();
      this.graphData = graphData;
      this.fullGraphData = fullGraphData;
      this.sliderDepth = this.depth;
    },

    handleOverlayState(rootElement) {
      const overlayActive = this.fullScreen || this.showFullGraph;
      const sidebar = rootElement.closest('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('on-top', overlayActive);
      }

      document.body.classList.toggle('has-fullscreen-graph', overlayActive);

      if (!this.graph) {
        return;
      }

      requestAnimationFrame(() => {
        const localGraph = rootElement.querySelector('#link-graph');
        if (localGraph && localGraph.offsetWidth > 0 && localGraph.offsetHeight > 0) {
          this.graph.width(localGraph.offsetWidth);
          this.graph.height(localGraph.offsetHeight);
          if (overlayActive) {
            this.graph.zoomToFit(10, 70);
          }
        }
      });
    },

    openFullGraph(rootElement) {
      const container = rootElement.querySelector('#full-graph-container');
      refreshIcons();
      this.fullGraph = renderGraph(this.fullGraphData, container, {
        fitDelay: 200,
        layoutMode: this.graphLabelLayout,
        rootElement,
      });
      return this.fullGraph;
    },

    closeFullGraph(rootElement) {
      destroyGraphAtElement(rootElement.querySelector('#full-graph-container'));
      this.fullGraph = null;
    },

    renderLocalGraph(rootElement) {
      const container = rootElement.querySelector('#link-graph');
      const localGraphData = filterLocalGraphData(this.graphData, this.depth);
      this.graph = renderGraph(localGraphData, container, {
        layoutMode: this.graphLabelLayout,
        rootElement,
      });
      window.graph = this.graph;
      return this.graph;
    },
  };
}

window.AtlasGraph = {
  createComponentState,
  destroyGraphAtElement,
  modes: {
    native: GRAPH_MODE_NATIVE,
    pretext: GRAPH_MODE_PRETEXT,
  },
};

window.addEventListener('pagehide', () => {
  destroyGraphAtElement(document.getElementById('link-graph'));
  destroyGraphAtElement(document.getElementById('full-graph-container'));
  window.graph = null;
});
