/**
 * @name Relative Importer
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Import files relative to the currently open project
 * @label IMPORT
 */

(function relativeImporter(thisObj) {
    var SCRIPT_NAME = "Relative Importer";
    var DEFAULT_LEVELS = 1;
    var PREF_SECTION = "js_RelativeImporter";
    var PREF_LEVELS_KEY = "levelsUp";
    var PREF_WIN_WIDTH_KEY = "windowWidth";
    var PREF_WIN_HEIGHT_KEY = "windowHeight";
    var PREF_EXPAND_ALL_KEY = "expandAll";

    // =========================================================
    // PREFERENCES
    // =========================================================

    function loadLevelsPref() {
        try {
            if (app.settings.haveSetting(PREF_SECTION, PREF_LEVELS_KEY)) {
                return app.settings.getSetting(PREF_SECTION, PREF_LEVELS_KEY);
            }
        } catch (e) {}
        return String(DEFAULT_LEVELS);
    }

    function saveLevelsPref(value) {
        try {
            app.settings.saveSetting(PREF_SECTION, PREF_LEVELS_KEY, String(value));
        } catch (e) {}
    }

    function loadWindowSizePref() {
        try {
            if (app.settings.haveSetting(PREF_SECTION, PREF_WIN_WIDTH_KEY) && app.settings.haveSetting(PREF_SECTION, PREF_WIN_HEIGHT_KEY)) {
                var w = parseInt(app.settings.getSetting(PREF_SECTION, PREF_WIN_WIDTH_KEY), 10);
                var h = parseInt(app.settings.getSetting(PREF_SECTION, PREF_WIN_HEIGHT_KEY), 10);
                if (w > 0 && h > 0) {
                    return [w, h];
                }
            }
        } catch (e) {}
        return null;
    }

    function saveWindowSizePref(size) {
        try {
            app.settings.saveSetting(PREF_SECTION, PREF_WIN_WIDTH_KEY, String(size[0]));
            app.settings.saveSetting(PREF_SECTION, PREF_WIN_HEIGHT_KEY, String(size[1]));
        } catch (e) {}
    }

    // =========================================================
    // UI
    // =========================================================

    var panel =
        thisObj instanceof Panel
            ? thisObj
            : new Window("palette", SCRIPT_NAME, undefined, {
                  resizeable: true
              });
    panel.orientation = "column";
    panel.alignChildren = ["fill", "top"];
    panel.margins = 8;
    panel.spacing = 6;

    var levelValue = parseInt(loadLevelsPref(), 10);
    if (isNaN(levelValue) || levelValue < 0) {
        levelValue = DEFAULT_LEVELS;
    }

    // Level control row
    var controlGroup = panel.add("group");
    controlGroup.orientation = "row";
    controlGroup.alignment = ["fill", "top"];
    controlGroup.alignChildren = ["left", "center"];
    controlGroup.spacing = 4;

    var arrowGroup = controlGroup.add("group");
    arrowGroup.orientation = "column";
    arrowGroup.spacing = 1;
    arrowGroup.margins = 0;

    var upBtn = arrowGroup.add("button", undefined, "\u25B2");
    upBtn.preferredSize = [26, 14];
    upBtn.helpTip = "Increase folder levels up";

    var downBtn = arrowGroup.add("button", undefined, "\u25BC");
    downBtn.preferredSize = [26, 14];
    downBtn.helpTip = "Decrease folder levels up";

    upBtn.onClick = function () {
        levelValue++;
        levelDisplay.text = String(levelValue);
        saveLevelsPref(levelValue);
        buildTree();
    };

    downBtn.onClick = function () {
        if (levelValue > 0) {
            levelValue--;
            levelDisplay.text = String(levelValue);
            saveLevelsPref(levelValue);
            buildTree();
        }
    };

    var levelDisplay = controlGroup.add("edittext", undefined, String(levelValue), {
        readonly: true,
        justify: "center"
    });
    levelDisplay.helpTip = "Current level of parent folders to traverse";
    levelDisplay.preferredSize = [29, 29];
    levelDisplay.alignment = ["left", "center"];

    var pathLabel = controlGroup.add("edittext", undefined, "Root: (no project saved)", {
        readonly: true,
        justify: "center"
    });
    pathLabel.helpTip = "Root path to begin scanning";
    pathLabel.preferredSize = [100, 29];
    pathLabel.alignment = ["fill", "center"];

    var refreshBtn = controlGroup.add("button", undefined, "Refresh");
    refreshBtn.preferredSize = [60, 29];
    refreshBtn.alignment = ["right", "center"];

    var expandAllActive = false;
    try {
        expandAllActive = app.settings.haveSetting(PREF_SECTION, PREF_EXPAND_ALL_KEY) && app.settings.getSetting(PREF_SECTION, PREF_EXPAND_ALL_KEY) === "true";
    } catch (e) {}

    var expandAllBtn = controlGroup.add("button", undefined, "");
    expandAllBtn.alignment = ["right", "center"];
    expandAllBtn.preferredSize = [80, 29];
    expandAllBtn.helpTip = "When expanding a folder, recursively expand and scan all subfolders";

    function updateExpandAllBtn() {
        expandAllBtn.text = expandAllActive ? "\u25CF  Expand All" : "\u25CB  Expand All";
    }
    updateExpandAllBtn();

    expandAllBtn.onClick = function () {
        expandAllActive = !expandAllActive;
        updateExpandAllBtn();
        try {
            app.settings.saveSetting(PREF_SECTION, PREF_EXPAND_ALL_KEY, String(expandAllActive));
        } catch (e) {}
    };

    // Root path display
    // var pathLabel = panel.add("statictext", undefined, "Root: (no project saved)", {
    //     truncate: "middle"
    // });
    // pathLabel.alignment = ["fill", "top"];

    // TreeView
    var treeView = panel.add("treeview", undefined, undefined, {
        multiselect: true
    });
    treeView.alignment = ["fill", "fill"];
    treeView.minimumSize = [0, 100];

    // Import button
    var importBtn = panel.add("button", undefined, "Import Selected");
    importBtn.alignment = ["fill", "bottom"];

    // =========================================================
    // ROOT FOLDER
    // =========================================================

    function getRootFolder() {
        if (!app.project.file) {
            return null;
        }
        var folder = app.project.file.parent;
        for (var i = 0; i < levelValue; i++) {
            if (folder && folder.parent) {
                folder = folder.parent;
            }
        }
        return folder;
    }

    // =========================================================
    // TREE BUILDING
    // =========================================================

    function buildTree() {
        while (treeView.items.length > 0) {
            treeView.remove(treeView.items[0]);
        }

        var root = getRootFolder();
        if (!root) {
            pathLabel.text = "Root: (no project saved)";
            treeView.add("item", "Save your project first...");
            return;
        }

        pathLabel.text = root.fsName;
        populateLevel(treeView, root);
    }

    /**
     * Adds the immediate children of folder into parent (treeView or a node).
     * Subfolders get a placeholder child so they show the expand triangle.
     * Image sequences are grouped into a single item.
     */
    function populateLevel(parent, folder) {
        var sorted = getSortedContents(folder);
        var seqs = getImageSequences(folder);
        var s;
        var seq;
        var i;
        var leaf;

        // Build a lookup of which files are part of a detected sequence
        var seqFirstFiles = {};
        for (s = 0; s < seqs.length; s++) {
            seqFirstFiles[seqs[s].file.absoluteURI] = seqs[s];
        }

        // Track which files we've already covered via a sequence entry
        var coveredBySeq = {};
        for (s = 0; s < seqs.length; s++) {
            seq = seqs[s];
            for (var f = 0; f < seq.frameCount; f++) {
                var frameNum = seq.startNum + f;
                var paddedNum = padZeros(frameNum, seq.numLen);
                var framePath = seq.file.parent.absoluteURI + "/" + seq.baseName + paddedNum + "." + seq.ext;
                coveredBySeq[framePath] = true;
            }
        }

        if (sorted.folders.length === 0 && sorted.files.length === 0 && seqs.length === 0) {
            var empty = parent.add("item", "(empty)");
            empty.isPlaceholder = true;
            return;
        }

        for (i = 0; i < sorted.folders.length; i++) {
            var folderItem = sorted.folders[i];
            var node = parent.add("node", toDisplayText(folderItem.displayName));
            node.fileObj = folderItem;
            node.isLoaded = false;
            var ph = node.add("item", "...");
            ph.isPlaceholder = true;
        }

        // Add sequence items first
        for (s = 0; s < seqs.length; s++) {
            seq = seqs[s];
            leaf = parent.add("item", toDisplayText(seq.displayName));
            leaf.fileObj = seq.file;
            leaf.isSequence = true;
        }

        // Add remaining individual files (not covered by a sequence)
        for (i = 0; i < sorted.files.length; i++) {
            var file = sorted.files[i];
            if (coveredBySeq[file.absoluteURI]) {
                continue;
            }
            leaf = parent.add("item", toDisplayText(file.displayName));
            leaf.fileObj = file;
            leaf.isSequence = false;
        }
    }

    /**
     * Loads the real children of a node, replacing its placeholder.
     */
    function loadNode(node) {
        if (node.isLoaded) {
            return;
        }
        node.isLoaded = true;

        // Remove placeholders
        for (var i = node.items.length - 1; i >= 0; i--) {
            if (node.items[i].isPlaceholder) {
                node.remove(node.items[i]);
            }
        }

        populateLevel(node, node.fileObj);
    }

    // =========================================================
    // FILE HELPERS
    // =========================================================

    function getSortedContents(folder) {
        var rawFiles = folder.getFiles() || [];
        var folders = [];
        var files = [];
        for (var i = 0; i < rawFiles.length; i++) {
            if (rawFiles[i].hidden) {
                continue;
            }
            if (rawFiles[i] instanceof Folder) {
                folders.push(rawFiles[i]);
            } else {
                files.push(rawFiles[i]);
            }
        }
        var byName = function (a, b) {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        };
        folders.sort(byName);
        files.sort(byName);
        return {
            folders: folders,
            files: files
        };
    }

    /**
     * Detects image sequences in a folder.
     * Returns an array of sequence descriptor objects.
     */
    function getImageSequences(folder) {
        var IMAGE_EXTS = {
            jpg: 1,
            jpeg: 1,
            png: 1,
            tif: 1,
            tiff: 1,
            tga: 1,
            exr: 1,
            dpx: 1,
            bmp: 1,
            hdr: 1,
            cin: 1,
            psd: 1
        };
        var MIN_FRAMES = 10;

        var files = (folder.getFiles() || []).filter(function (f) {
            if (f instanceof Folder || f.hidden) {
                return false;
            }
            var ext = f.name.split(".").pop().toLowerCase();
            return IMAGE_EXTS[ext];
        });

        files.sort(function (a, b) {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        });

        var seqs = [];
        var i = 0;
        while (i < files.length) {
            var file = files[i];
            var name = file.name;
            var ext = name.split(".").pop();
            var nameNoExt = name.substring(0, name.lastIndexOf("."));
            var trailingNum = nameNoExt.match(/(\d+)$/);

            if (!trailingNum) {
                i++;
                continue;
            }

            var numStr = trailingNum[1];
            var numLen = numStr.length;
            var startNum = parseInt(numStr, 10);
            var baseName = nameNoExt.substring(0, nameNoExt.length - numStr.length); // URL-encoded, used for matching

            // Count consecutive frames
            var count = 1;
            while (i + count < files.length) {
                var nextFile = files[i + count];
                var nextNameNoExt = nextFile.name.substring(0, nextFile.name.lastIndexOf("."));
                var nextNumMatch = nextNameNoExt.match(/(\d+)$/);
                if (!nextNumMatch) {
                    break;
                }
                var nextBase = nextNameNoExt.substring(0, nextNameNoExt.length - nextNumMatch[1].length);
                if (nextBase !== baseName || parseInt(nextNumMatch[1], 10) !== startNum + count) {
                    break;
                }
                count++;
            }

            if (count >= MIN_FRAMES) {
                var endNum = startNum + count - 1;
                // Build display name from displayName (human-readable) rather than name (URL-encoded)
                var dispNameNoExt = file.displayName.substring(0, file.displayName.lastIndexOf("."));
                var dispBase = dispNameNoExt.substring(0, dispNameNoExt.length - numStr.length);
                var displayName = dispBase + "[" + padZeros(startNum, numLen) + "-" + padZeros(endNum, numLen) + "]." + ext;
                seqs.push({
                    file: file,
                    displayName: displayName,
                    baseName: baseName,
                    ext: ext,
                    startNum: startNum,
                    numLen: numLen,
                    frameCount: count
                });
                i += count;
            } else {
                i++;
            }
        }

        return seqs;
    }

    function padZeros(num, length) {
        var s = String(num);
        while (s.length < length) {
            s = "0" + s;
        }
        return s;
    }

    // ScriptUI treeview renders spaces as underscores on some platforms.
    // Non-breaking space (\u00A0) displays correctly while still looking like a space.
    function toDisplayText(name) {
        return name.replace(/ /g, "\u00A0");
    }

    // =========================================================
    // IMPORT
    // =========================================================

    function importSelected() {
        var toImport = [];
        collectSelected(treeView.items, toImport);

        if (toImport.length === 0) {
            alert("No files selected.");
            return;
        }

        app.beginUndoGroup("Relative Import");
        var imported = 0;
        var errors = [];

        for (var i = 0; i < toImport.length; i++) {
            try {
                var options = new ImportOptions();
                options.file = toImport[i].file;
                options.sequence = toImport[i].isSequence;
                var importedItem = app.project.importFile(options);
                if (importedItem && app.project.activeItem instanceof CompItem) {
                    app.project.activeItem.layers.add(importedItem);
                }
                imported++;
            } catch (err) {
                errors.push(toImport[i].file.name + ": " + err);
            }
        }

        app.endUndoGroup();

        if (errors.length > 0) {
            alert("Imported " + imported + " item(s) with " + errors.length + " error(s):\n" + errors.join("\n"));
        }
    }

    /**
     * Recursively collects selected leaf items from the treeview.
     * If a folder node is selected, collects all files from disk recursively.
     * Deduplicates by absoluteURI.
     */
    function collectSelected(items, result) {
        var seen = {};
        // We need seen to be shared across recursive calls, so use a closure approach
        collectSelectedInner(items, result, seen);
    }

    function collectSelectedInner(items, result, seen) {
        if (!items) {
            return;
        }
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.selected) {
                if (item.type === "node" && item.fileObj) {
                    // Folder selected — collect all files from disk
                    collectFromFolder(item.fileObj, result, seen);
                } else if (item.type === "item" && item.fileObj && !item.isPlaceholder) {
                    var uri = item.fileObj.absoluteURI;
                    if (!seen[uri]) {
                        seen[uri] = true;
                        result.push({
                            file: item.fileObj,
                            isSequence: !!item.isSequence
                        });
                    }
                }
            } else if (item.type === "node" && item.items) {
                collectSelectedInner(item.items, result, seen);
            }
        }
    }

    function collectFromFolder(folder, result, seen) {
        var files = folder.getFiles() || [];
        var seqs = getImageSequences(folder);

        // Track which files are covered by a sequence
        var coveredBySeq = {};
        var uri;
        var s;
        for (s = 0; s < seqs.length; s++) {
            var seq = seqs[s];
            for (var f = 0; f < seq.frameCount; f++) {
                var frameNum = seq.startNum + f;
                var paddedNum = padZeros(frameNum, seq.numLen);
                coveredBySeq[seq.file.parent.absoluteURI + "/" + seq.baseName + paddedNum + "." + seq.ext] = true;
            }
        }

        // Add sequences
        for (s = 0; s < seqs.length; s++) {
            uri = seqs[s].file.absoluteURI;
            if (!seen[uri]) {
                seen[uri] = true;
                result.push({
                    file: seqs[s].file,
                    isSequence: true
                });
            }
        }

        // Add individual files and recurse into subfolders
        for (var i = 0; i < files.length; i++) {
            if (files[i] instanceof Folder) {
                collectFromFolder(files[i], result, seen);
            } else if (!coveredBySeq[files[i].absoluteURI]) {
                uri = files[i].absoluteURI;
                if (!seen[uri]) {
                    seen[uri] = true;
                    result.push({
                        file: files[i],
                        isSequence: false
                    });
                }
            }
        }
    }

    // =========================================================
    // EVENTS
    // =========================================================

    // Guard prevents onExpand from re-firing while we programmatically set expanded=true
    // on child nodes during a recursive expand.
    var expandingRecursively = false;

    function expandRecursive(node) {
        loadNode(node);
        node.expanded = false;
        node.expanded = true;
        for (var i = 0; i < node.items.length; i++) {
            if (node.items[i].type === "node") {
                expandRecursive(node.items[i]);
            }
        }
    }

    // onExpand fires on the treeview itself and receives the expanded node as an argument.
    // The double-whammy (expanded=false then true) forces ScriptUI to redraw newly added children.
    treeView.onExpand = function (node) {
        if (expandingRecursively) {
            return;
        }
        if (!node.isLoaded) {
            loadNode(node);
            node.expanded = false;
            node.expanded = true;
        }
        if (expandAllActive) {
            expandingRecursively = true;
            expandRecursive(node);
            expandingRecursively = false;
        }
    };

    refreshBtn.onClick = function () {
        buildTree();
    };

    importBtn.onClick = function () {
        importSelected();
    };

    // Double-click imports immediately
    treeView.onDoubleClick = function () {
        importSelected();
    };

    // =========================================================
    // INIT
    // =========================================================

    buildTree();

    panel.onResizing = panel.onResize = function () {
        this.layout.resize();
        if (panel instanceof Window) {
            saveWindowSizePref(this.size);
        }
    };

    if (panel instanceof Window) {
        if (!app.project.file) {
            alert(SCRIPT_NAME + ": Please save your project first.");
            return;
        }
        var savedSize = loadWindowSizePref();
        panel.preferredSize = savedSize || [400, 500];
        panel.center();
        panel.show();
    } else {
        panel.layout.layout(true);
        panel.layout.resize();
    }
})(this);
