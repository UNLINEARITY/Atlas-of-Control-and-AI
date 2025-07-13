const sortTree = (unsorted) => {
  const orderedTree = Object.keys(unsorted)
    .sort((a, b) => {
      let a_pinned = unsorted[a].pinned || false;
      let b_pinned = unsorted[b].pinned || false;
      if (a_pinned != b_pinned) {
        return a_pinned ? -1 : 1;
      }

      const a_is_note = a.includes(".md");
      const b_is_note = b.includes(".md");
      if (a_is_note !== b_is_note) {
        return a_is_note ? 1 : -1;
      }

      const aNum = parseFloat(a.match(/^\d+(\.\d+)?/));
      const bNum = parseFloat(b.match(/^\d+(\.\d+)?/));
      const a_is_num = !isNaN(aNum);
      const b_is_num = !isNaN(bNum);
      if (a_is_num && b_is_num && aNum !== bNum) {
        return aNum - bNum;
      }

      return a.toLowerCase().localeCompare(b.toLowerCase());
    })
    .reduce((obj, key) => {
      obj[key] = unsorted[key];
      return obj;
    }, {});

  for (const key of Object.keys(orderedTree)) {
    if (orderedTree[key].isFolder) {
      orderedTree[key] = sortTree(orderedTree[key]);
    }
  }

  return orderedTree;
};

function getPermalinkMeta(note, key) {
  let permalink = "/";
  let parts = note.filePathStem.split("/");
  let name = parts[parts.length - 1];
  let noteIcon = process.env.NOTE_ICON_DEFAULT;
  let hide = false;
  let pinned = false;
  let folders = [];

  try {
    permalink = note.data?.permalink || permalink;
    if (note.data?.tags?.includes("gardenEntry")) {
      permalink = "/";
    }
    name = note.data?.title || name;
    noteIcon = note.data?.noteIcon || noteIcon;
    hide = note.data?.hide || false;
    pinned = note.data?.pinned || false;

    if (note.data?.["dg-path"]) {
      folders = note.data["dg-path"].split("/");
    } else {
      folders = note.filePathStem.split("notes/")[1].split("/");
    }

    if (folders.length > 0) {
      folders[folders.length - 1] += ".md";
    }
  } catch (e) {
    console.warn(`Failed to parse note metadata: ${note.filePathStem}`, e);
  }

  return [{ permalink, name, noteIcon, hide, pinned }, folders];
}

function assignNested(obj, keyPath, value) {
  const lastKeyIndex = keyPath.length - 1;
  for (let i = 0; i < lastKeyIndex; ++i) {
    const key = keyPath[i];
    if (!(key in obj)) {
      obj[key] = { isFolder: true };
    }
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

function getFileTree(data) {
  const notes = (data?.collections?.note) || []; // ✅ 防御性访问
  const tree = {};

  notes.forEach((note) => {
    const [meta, folders] = getPermalinkMeta(note);
    assignNested(tree, folders, { isNote: true, ...meta });
  });

  return sortTree(tree);
}

exports.getFileTree = getFileTree;
