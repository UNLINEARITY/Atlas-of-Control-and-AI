import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext';
import { refreshIcons } from './modules/icons.js';

const LABEL_LAYOUT_CACHE = new Map();
const GRAPH_MODE_PRETEXT = 'pretext';
const GRAPH_MODE_NATIVE = 'native';
const GRAPH_LABEL_FONT = '400 3.5px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif';
const GRAPH_LABEL_LINE_HEIGHT = 4.75;
const GRAPH_LABEL_LINE_LIMIT = 3;
const GRAPH_LABEL_PADDING_X = 2.4;
const GRAPH_LABEL_PADDING_Y = 1.35;
const GRAPH_LABEL_MARGIN = 2.75;
const GRAPH_LABEL_OVERSCAN = 10;
const GRAPH_LABEL_ANIMATION = 0.24;
const GRAPH_LABEL_COLLISION_WEIGHT = 3.2;
const GRAPH_LABEL_NODE_COLLISION_WEIGHT = 180;
const GRAPH_LABEL_EDGE_WEIGHT = 12;
const GRAPH_LABEL_STABILITY_BONUS = 18;
const GRAPH_LABEL_FALLBACK_CHAR_WIDTH = 2.35;
const GRAPH_LABEL_COLLISION_PADDING = 18;
const GRAPH_FULL_LABEL_BUDGET_FAR = 0;
const GRAPH_FULL_LABEL_BUDGET_MID = 12;
const GRAPH_FULL_LABEL_BUDGET_NEAR = 24;
const GRAPH_FULL_LABEL_BUDGET_CLOSE = 48;
const GRAPH_FULL_LABEL_BUDGET_DETAIL = 96;
const GRAPH_FULL_LABEL_RECALCULATE_MS = 90;
const GRAPH_FULL_LABEL_ZOOM_DELTA = 0.08;
const GRAPH_LABEL_CANDIDATES = [
  { name: 'bottom', vectorX: 0, vectorY: 1, alignX: 'center', alignY: 'top', bias: 0 },
  { name: 'bottom-right', vectorX: 1, vectorY: 1, alignX: 'left', alignY: 'top', bias: 2.2 },
  { name: 'bottom-left', vectorX: -1, vectorY: 1, alignX: 'right', alignY: 'top', bias: 2.4 },
  { name: 'right', vectorX: 1, vectorY: 0, alignX: 'left', alignY: 'middle', bias: 2.8 },
  { name: 'left', vectorX: -1, vectorY: 0, alignX: 'right', alignY: 'middle', bias: 3.1 },
  { name: 'top', vectorX: 0, vectorY: -1, alignX: 'center', alignY: 'bottom', bias: 4.8 },
  { name: 'top-right', vectorX: 1, vectorY: -1, alignX: 'left', alignY: 'bottom', bias: 5.3 },
  { name: 'top-left', vectorX: -1, vectorY: -1, alignX: 'right', alignY: 'bottom', bias: 5.6 },
];

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

function _drawNodeLabelLegacy(ctx, node, nodeRadius, layoutMode) {
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

function getNodeLabel(node) {
  if (node.__decodedTitle === undefined) {
    node.__decodedTitle = htmlDecode(node.title);
  }
  return node.__decodedTitle;
}

function getNodeRadius(node) {
  const numberOfNeighbours = (node.neighbors && node.neighbors.length) || 2;
  return Math.min(7, Math.max(numberOfNeighbours / 2, 2));
}

function getNodeLabelMaxWidth(node) {
  return node.current ? 64 : 52;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPreparedLabel(label) {
  const cacheKey = `prepared::${GRAPH_LABEL_FONT}::${label}`;
  if (LABEL_LAYOUT_CACHE.has(cacheKey)) {
    return LABEL_LAYOUT_CACHE.get(cacheKey);
  }

  const prepared = prepareWithSegments(label, GRAPH_LABEL_FONT);
  LABEL_LAYOUT_CACHE.set(cacheKey, prepared);
  return prepared;
}

function getLabelMetrics(label, mode, maxWidth) {
  if (!label) {
    return null;
  }

  const layoutWidth = mode === GRAPH_MODE_PRETEXT ? maxWidth : 4096;
  const cacheKey = `layout::${mode}::${GRAPH_LABEL_FONT}::${layoutWidth}::${label}`;
  if (LABEL_LAYOUT_CACHE.has(cacheKey)) {
    return LABEL_LAYOUT_CACHE.get(cacheKey);
  }

  try {
    const prepared = getPreparedLabel(label);
    const { lines } = layoutWithLines(prepared, layoutWidth, GRAPH_LABEL_LINE_HEIGHT);
    const visibleLines = lines
      .map((line) => ({
        text: line.text.trim(),
        width: mode === GRAPH_MODE_PRETEXT ? Math.min(maxWidth, line.width) : line.width,
      }))
      .filter((line) => line.text)
      .slice(0, mode === GRAPH_MODE_PRETEXT ? GRAPH_LABEL_LINE_LIMIT : 1);

    if (mode === GRAPH_MODE_PRETEXT && lines.length > GRAPH_LABEL_LINE_LIMIT && visibleLines.length > 0) {
      const lastLine = visibleLines[visibleLines.length - 1];
      visibleLines[visibleLines.length - 1] = {
        text: `${lastLine.text.replace(/\.{3,}$/u, '').trim()}...`,
        width: maxWidth,
      };
    }

    const textWidth = visibleLines.reduce((widest, line) => Math.max(widest, line.width), 0);
    const metrics = {
      lines: visibleLines,
      textWidth,
      width: textWidth + GRAPH_LABEL_PADDING_X * 2,
      height: visibleLines.length * GRAPH_LABEL_LINE_HEIGHT + GRAPH_LABEL_PADDING_Y * 2,
    };
    LABEL_LAYOUT_CACHE.set(cacheKey, metrics);
    return metrics;
  } catch (error) {
    console.warn('Pretext label layout failed, falling back to basic label metrics.', error);
    const fallbackTextWidth = Math.min(
      maxWidth,
      Math.max(GRAPH_LABEL_LINE_HEIGHT * 2, label.length * GRAPH_LABEL_FALLBACK_CHAR_WIDTH)
    );
    const metrics = {
      lines: [{ text: label, width: fallbackTextWidth }],
      textWidth: fallbackTextWidth,
      width: fallbackTextWidth + GRAPH_LABEL_PADDING_X * 2,
      height: GRAPH_LABEL_LINE_HEIGHT + GRAPH_LABEL_PADDING_Y * 2,
    };
    LABEL_LAYOUT_CACHE.set(cacheKey, metrics);
    return metrics;
  }
}

function getGraphViewportBounds(graph, element, globalScale) {
  if (!graph || !element || element.offsetWidth <= 0 || element.offsetHeight <= 0) {
    return null;
  }

  const topLeft = graph.screen2GraphCoords(0, 0);
  const bottomRight = graph.screen2GraphCoords(element.offsetWidth, element.offsetHeight);
  const overscan = GRAPH_LABEL_OVERSCAN / Math.max(globalScale || 1, 0.001);

  return {
    left: Math.min(topLeft.x, bottomRight.x) + overscan,
    right: Math.max(topLeft.x, bottomRight.x) - overscan,
    top: Math.min(topLeft.y, bottomRight.y) + overscan,
    bottom: Math.max(topLeft.y, bottomRight.y) - overscan,
  };
}

function clampLabelBox(box, bounds) {
  if (!bounds) {
    return box;
  }

  const maxX = Math.max(bounds.left, bounds.right - box.width);
  const maxY = Math.max(bounds.top, bounds.bottom - box.height);
  return {
    ...box,
    x: clamp(box.x, bounds.left, maxX),
    y: clamp(box.y, bounds.top, maxY),
  };
}

function getRectIntersectionArea(a, b) {
  const overlapWidth = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const overlapHeight = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

  if (overlapWidth <= 0 || overlapHeight <= 0) {
    return 0;
  }

  return overlapWidth * overlapHeight;
}

function getRectOverflow(box, bounds) {
  if (!bounds) {
    return 0;
  }

  return (
    Math.max(0, bounds.left - box.x) +
    Math.max(0, box.x + box.width - bounds.right) +
    Math.max(0, bounds.top - box.y) +
    Math.max(0, box.y + box.height - bounds.bottom)
  );
}

function doesCircleIntersectRect(node, radius, box, padding = 0) {
  const closestX = clamp(node.x, box.x - padding, box.x + box.width + padding);
  const closestY = clamp(node.y, box.y - padding, box.y + box.height + padding);
  const dx = node.x - closestX;
  const dy = node.y - closestY;
  const effectiveRadius = radius + padding;

  return dx * dx + dy * dy < effectiveRadius * effectiveRadius;
}

function createLabelPlacement(node, nodeRadius, metrics, candidate, bounds) {
  const vectorLength = Math.hypot(candidate.vectorX, candidate.vectorY) || 1;
  const offsetDistance = nodeRadius + GRAPH_LABEL_MARGIN;
  const anchorX = node.x + (candidate.vectorX / vectorLength) * offsetDistance;
  const anchorY = node.y + (candidate.vectorY / vectorLength) * offsetDistance;

  let x = anchorX;
  if (candidate.alignX === 'center') {
    x -= metrics.width / 2;
  } else if (candidate.alignX === 'right') {
    x -= metrics.width;
  }

  let y = anchorY;
  if (candidate.alignY === 'middle') {
    y -= metrics.height / 2;
  } else if (candidate.alignY === 'bottom') {
    y -= metrics.height;
  }

  const box = clampLabelBox(
    {
      x,
      y,
      width: metrics.width,
      height: metrics.height,
      anchorX,
      anchorY,
      candidate: candidate.name,
      bias: candidate.bias,
    },
    bounds
  );

  return {
    ...box,
    textX: box.x + box.width / 2,
    textY: box.y + GRAPH_LABEL_PADDING_Y,
    lines: metrics.lines,
  };
}

function getStaticLabelPlacement(node, layoutMode, bounds) {
  const metrics = getLabelMetrics(getNodeLabel(node), layoutMode, getNodeLabelMaxWidth(node));
  if (!metrics) {
    return null;
  }

  return createLabelPlacement(node, getNodeRadius(node), metrics, GRAPH_LABEL_CANDIDATES[0], bounds);
}

function getLabelPriority(node, hoverNode, selectedNodes) {
  let priority = (node.neighbors?.length || 0) * 4;
  if (node.current) {
    priority += 1000;
  }
  if (selectedNodes.has(node.url)) {
    priority += 800;
  }
  if (hoverNode?.url === node.url) {
    priority += 700;
  }
  if (hoverNode?.neighbors?.includes(node.url)) {
    priority += 120;
  }
  return priority;
}

function getDynamicLabelBudget(isFullGraph, globalScale) {
  if (!isFullGraph) {
    return Number.POSITIVE_INFINITY;
  }
  if (globalScale < 0.7) {
    return GRAPH_FULL_LABEL_BUDGET_FAR;
  }
  if (globalScale < 1.05) {
    return GRAPH_FULL_LABEL_BUDGET_MID;
  }
  if (globalScale < 1.7) {
    return GRAPH_FULL_LABEL_BUDGET_NEAR;
  }
  if (globalScale < 2.6) {
    return GRAPH_FULL_LABEL_BUDGET_CLOSE;
  }
  return GRAPH_FULL_LABEL_BUDGET_DETAIL;
}

function getPositionedNodesForLabels(nodes, bounds) {
  const visibilityPadding = 96;
  return nodes.filter(
    (node) =>
      Number.isFinite(node.x) &&
      Number.isFinite(node.y) &&
      getNodeLabel(node) &&
      (!bounds ||
        (node.x >= bounds.left - visibilityPadding &&
          node.x <= bounds.right + visibilityPadding &&
          node.y >= bounds.top - visibilityPadding &&
          node.y <= bounds.bottom + visibilityPadding))
  );
}

function getNearbyCollisionNodes(node, positionedNodes, metrics) {
  const collisionRangeX = metrics.width + GRAPH_LABEL_COLLISION_PADDING;
  const collisionRangeY = metrics.height + GRAPH_LABEL_COLLISION_PADDING;

  return positionedNodes.filter(
    (otherNode) =>
      otherNode !== node &&
      Math.abs(otherNode.x - node.x) <= collisionRangeX &&
      Math.abs(otherNode.y - node.y) <= collisionRangeY
  );
}

function selectNodesForDynamicLabels(nodes, hoverNode, selectedNodes, bounds, globalScale, isFullGraph) {
  const positionedNodes = getPositionedNodesForLabels(nodes, bounds);
  const sortedNodes = [...positionedNodes].sort(
    (leftNode, rightNode) =>
      getLabelPriority(rightNode, hoverNode, selectedNodes) - getLabelPriority(leftNode, hoverNode, selectedNodes)
  );
  const budget = getDynamicLabelBudget(isFullGraph, globalScale);
  const selectedLabelNodes = [];
  const selectedUrls = new Set();

  const addNode = (node) => {
    if (!node || selectedUrls.has(node.url)) {
      return;
    }
    selectedUrls.add(node.url);
    selectedLabelNodes.push(node);
  };

  sortedNodes.forEach((node) => {
    if (
      node.current ||
      selectedNodes.has(node.url) ||
      hoverNode?.url === node.url ||
      hoverNode?.neighbors?.includes(node.url)
    ) {
      addNode(node);
    }
  });

  if (budget !== Number.POSITIVE_INFINITY) {
    for (const node of sortedNodes) {
      if (selectedLabelNodes.length >= budget) {
        break;
      }
      addNode(node);
    }
  } else {
    sortedNodes.forEach(addNode);
  }

  return {
    positionedNodes,
    labelNodes: selectedLabelNodes,
    labelUrls: selectedUrls,
  };
}

function animateLabelPlacement(node, targetPlacement) {
  const previousPlacement = node.__labelPlacement;
  if (!previousPlacement) {
    node.__labelPlacement = { ...targetPlacement };
    return node.__labelPlacement;
  }

  previousPlacement.x += (targetPlacement.x - previousPlacement.x) * GRAPH_LABEL_ANIMATION;
  previousPlacement.y += (targetPlacement.y - previousPlacement.y) * GRAPH_LABEL_ANIMATION;
  previousPlacement.width = targetPlacement.width;
  previousPlacement.height = targetPlacement.height;
  previousPlacement.anchorX = targetPlacement.anchorX;
  previousPlacement.anchorY = targetPlacement.anchorY;
  previousPlacement.textX = previousPlacement.x + previousPlacement.width / 2;
  previousPlacement.textY = previousPlacement.y + GRAPH_LABEL_PADDING_Y;
  previousPlacement.lines = targetPlacement.lines;
  previousPlacement.candidate = targetPlacement.candidate;
  previousPlacement.bias = targetPlacement.bias;
  return previousPlacement;
}

function scoreLabelPlacement(node, candidatePlacement, collisionNodes, placedBoxes, bounds, previousCandidate) {
  let score = candidatePlacement.bias;
  score += getRectOverflow(candidatePlacement, bounds) * GRAPH_LABEL_EDGE_WEIGHT;

  if (previousCandidate === candidatePlacement.candidate) {
    score -= GRAPH_LABEL_STABILITY_BONUS;
  }

  for (const placedBox of placedBoxes) {
    const overlapArea = getRectIntersectionArea(candidatePlacement, placedBox);
    if (overlapArea > 0) {
      score += overlapArea * GRAPH_LABEL_COLLISION_WEIGHT;
    }
  }

  for (const otherNode of collisionNodes) {
    if (doesCircleIntersectRect(otherNode, getNodeRadius(otherNode), candidatePlacement, 1.75)) {
      score += GRAPH_LABEL_NODE_COLLISION_WEIGHT;
    }
  }

  return score;
}

function computeDynamicLabelPlacements(nodes, hoverNode, selectedNodes, bounds, globalScale, isFullGraph) {
  const { positionedNodes, labelNodes, labelUrls } = selectNodesForDynamicLabels(
    nodes,
    hoverNode,
    selectedNodes,
    bounds,
    globalScale,
    isFullGraph
  );
  const sortedNodes = [...labelNodes].sort(
    (leftNode, rightNode) =>
      getLabelPriority(rightNode, hoverNode, selectedNodes) - getLabelPriority(leftNode, hoverNode, selectedNodes)
  );
  const placedBoxes = [];

  nodes.forEach((node) => {
    node.__graphLabelVisible = labelUrls.has(node.url);
    if (!node.__graphLabelVisible) {
      node.__labelPlacement = null;
    }
  });

  sortedNodes.forEach((node) => {
    const metrics = getLabelMetrics(getNodeLabel(node), GRAPH_MODE_PRETEXT, getNodeLabelMaxWidth(node));
    if (!metrics) {
      node.__labelPlacement = null;
      return;
    }

    const nodeRadius = getNodeRadius(node);
    const previousCandidate = node.__labelPlacement?.candidate;
    const collisionNodes = getNearbyCollisionNodes(node, positionedNodes, metrics);
    let bestPlacement = null;
    let bestScore = Number.POSITIVE_INFINITY;

    GRAPH_LABEL_CANDIDATES.forEach((candidate) => {
      const candidatePlacement = createLabelPlacement(node, nodeRadius, metrics, candidate, bounds);
      const score = scoreLabelPlacement(
        node,
        candidatePlacement,
        collisionNodes,
        placedBoxes,
        bounds,
        previousCandidate
      );

      if (score < bestScore) {
        bestPlacement = candidatePlacement;
        bestScore = score;
      }
    });

    if (!bestPlacement) {
      node.__labelPlacement = null;
      return;
    }

    const animatedPlacement = animateLabelPlacement(node, bestPlacement);
    placedBoxes.push(animatedPlacement);
  });
}

function shouldRecomputeDynamicLabels(element, hoverNode, selectedNodes, globalScale, isFullGraph) {
  const hoverUrl = hoverNode?.url || '';
  const selectedKey = selectedNodes.size > 0 ? [...selectedNodes].sort().join('|') : '';
  const state = element.__graphLabelFrameState || {
    hoverUrl: '',
    lastComputedAt: 0,
    lastScale: null,
    selectedKey: '',
  };

  if (!isFullGraph) {
    state.hoverUrl = hoverUrl;
    state.selectedKey = selectedKey;
    state.lastScale = globalScale;
    state.lastComputedAt = performance.now();
    element.__graphLabelFrameState = state;
    return true;
  }

  const now = performance.now();
  const zoomChanged = state.lastScale == null || Math.abs(globalScale - state.lastScale) >= GRAPH_FULL_LABEL_ZOOM_DELTA;
  const interactionChanged = state.hoverUrl !== hoverUrl || state.selectedKey !== selectedKey;
  const isDue = now - state.lastComputedAt >= GRAPH_FULL_LABEL_RECALCULATE_MS;

  if (!zoomChanged && !interactionChanged && !isDue) {
    return false;
  }

  state.hoverUrl = hoverUrl;
  state.selectedKey = selectedKey;
  state.lastScale = globalScale;
  state.lastComputedAt = now;
  element.__graphLabelFrameState = state;
  return true;
}

function getResolvedLabelPlacement(node, layoutMode, bounds) {
  if (layoutMode === GRAPH_MODE_PRETEXT && node.__graphLabelVisible === false) {
    return null;
  }
  if (layoutMode === GRAPH_MODE_PRETEXT && node.__labelPlacement) {
    return node.__labelPlacement;
  }
  return getStaticLabelPlacement(node, layoutMode, bounds);
}

function drawLabelConnector(ctx, node, nodeRadius, placement, layoutMode) {
  if (!placement || layoutMode !== GRAPH_MODE_PRETEXT || placement.candidate === 'bottom') {
    return;
  }

  const targetX = clamp(node.x, placement.x, placement.x + placement.width);
  const targetY = clamp(node.y, placement.y, placement.y + placement.height);
  const dx = targetX - node.x;
  const dy = targetY - node.y;
  const distance = Math.hypot(dx, dy) || 1;
  const startX = node.x + (dx / distance) * (nodeRadius + 0.6);
  const startY = node.y + (dy / distance) * (nodeRadius + 0.6);

  ctx.save();
  ctx.globalAlpha *= 0.28;
  ctx.lineWidth = 0.45;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(targetX, targetY);
  ctx.stroke();
  ctx.restore();
}

function drawSmartNodeLabel(ctx, node, nodeRadius, layoutMode, bounds) {
  const placement = getResolvedLabelPlacement(node, layoutMode, bounds);
  if (!placement || placement.lines.length === 0) {
    return;
  }

  drawLabelConnector(ctx, node, nodeRadius, placement, layoutMode);

  ctx.font = GRAPH_LABEL_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  placement.lines.forEach((line, index) => {
    ctx.fillText(line.text, placement.textX, placement.textY + index * GRAPH_LABEL_LINE_HEIGHT);
  });
}

function paintNodePointerArea(node, color, ctx, layoutMode, bounds) {
  const nodeRadius = getNodeRadius(node);
  const placement = getResolvedLabelPlacement(node, layoutMode, bounds);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x, node.y, nodeRadius + 1.5, 0, 2 * Math.PI, false);
  ctx.fill();

  if (placement) {
    ctx.fillRect(placement.x - 1.25, placement.y - 1.25, placement.width + 2.5, placement.height + 2.5);
  }
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

  element.__graphLabelFrameState = null;

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
    layoutMode = GRAPH_MODE_PRETEXT,
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
  let graphViewportBounds = null;
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
    .autoPauseRedraw(isFullGraph)
    .nodePointerAreaPaint((node, colorValue, ctx) => {
      paintNodePointerArea(node, colorValue, ctx, layoutMode, graphViewportBounds);
    })
    .onRenderFramePre((_ctx, globalScale) => {
      graphViewportBounds = getGraphViewportBounds(graph, element, globalScale);
      if (
        layoutMode === GRAPH_MODE_PRETEXT &&
        shouldRecomputeDynamicLabels(element, hoverNode, selectedNodes, globalScale, isFullGraph)
      ) {
        computeDynamicLabelPlacements(graphData.nodes, hoverNode, selectedNodes, graphViewportBounds, globalScale, isFullGraph);
      } else if (layoutMode !== GRAPH_MODE_PRETEXT) {
        graphData.nodes.forEach((node) => {
          node.__labelPlacement = null;
        });
      }
    })
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
      const nodeRadius = getNodeRadius(node);

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

      drawSmartNodeLabel(ctx, node, nodeRadius, layoutMode, graphViewportBounds);
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
    graphLabelLayout: GRAPH_MODE_PRETEXT,
    showFullGraph: false,
    sliderDepth: 1,

    async initialize(rootElement) {
      this.graphLabelLayout = rootElement.dataset.graphLabelLayout || GRAPH_MODE_PRETEXT;
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
