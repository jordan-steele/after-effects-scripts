/**
 * @name Relink
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Relink selected missing footage by recursively searching a chosen folder
 * @label RELINK
 */

(function relinkProjectItems() {
    var SCRIPT_NAME = "Relink";
    var SEQUENCE_SKIP_THRESHOLD = 10;

    function normalizeName(name) {
        if (!name) {
            return "";
        }

        var out = String(name);

        try {
            out = decodeURI(out);
        } catch (e1) {}

        try {
            out = decodeURIComponent(out);
        } catch (e2) {}

        out = out.replace(/\\/g, "/").split("/").pop();
        out = out.toLowerCase();

        return out;
    }

    function safeBasenameFromFile(fileObj) {
        if (!fileObj) {
            return "";
        }

        try {
            if (fileObj.name) {
                return fileObj.name;
            }
        } catch (e1) {}

        try {
            var s = String(fileObj);
            s = s.replace(/\\/g, "/");
            return s.split("/").pop();
        } catch (e2) {}

        return "";
    }

    function uniquePush(arr, value) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === value) {
                return;
            }
        }
        arr.push(value);
    }

    function buildFirstFrameNameFromDisplay(displayName) {
        var match;
        var extMatch;

        if (!displayName) {
            return "";
        }

        match = String(displayName).match(/^(.*)\[(\d+)\-(\d+)\](\.[^\.]+)$/);
        if (match) {
            return match[1] + match[2] + match[4];
        }

        extMatch = String(displayName).match(/^(.*)\[(\d+)\-(\d+)\]$/);
        if (extMatch) {
            return extMatch[1] + extMatch[2];
        }

        return "";
    }

    function addMapEntry(map, key, target) {
        if (!key) {
            return;
        }

        if (!map[key]) {
            map[key] = [];
        }

        map[key].push(target);
    }

    function parseSequenceDescriptor(name) {
        var clean = normalizeName(name);
        var match;

        if (!clean) {
            return null;
        }

        match = clean.match(/^(.*?)(\d+)(\.[^\.\/]+)$/);
        if (!match) {
            return null;
        }

        return {
            key: match[1] + "__digits" + String(match[2].length) + "__" + match[3],
            frame: parseInt(match[2], 10)
        };
    }

    function addSequenceGroupKey(groupMap, name) {
        var descriptor = parseSequenceDescriptor(name);
        if (descriptor) {
            groupMap[descriptor.key] = true;
        }
    }

    function compareEntriesByName(a, b) {
        var aIsFolder = a instanceof Folder;
        var bIsFolder = b instanceof Folder;
        var aName = "";
        var bName = "";

        if (aIsFolder !== bIsFolder) {
            return aIsFolder ? -1 : 1;
        }

        try {
            aName = normalizeName(a.name || a.displayName || "");
        } catch (e1) {}

        try {
            bName = normalizeName(b.name || b.displayName || "");
        } catch (e2) {}

        if (aName < bName) {
            return -1;
        }

        if (aName > bName) {
            return 1;
        }

        return 0;
    }

    function isLikelySequenceItem(item) {
        var name = "";

        try {
            name = item.name || "";
        } catch (e1) {}

        if (/\[\d+\-\d+\]/.test(name)) {
            return true;
        }

        try {
            if (item.mainSource && item.mainSource.isStill === false) {
                var original = safeBasenameFromFile(item.mainSource.file);
                if (original && /\d+/.test(original)) {
                    return true;
                }
            }
        } catch (e2) {}

        return false;
    }

    function getSelectedMissingFootage() {
        var raw = app.project.selection;
        var files = [];
        var sequences = [];

        for (var i = 0; i < raw.length; i++) {
            var item = raw[i];

            if (!(item instanceof FootageItem)) {
                continue;
            }

            if (!item.footageMissing) {
                continue;
            }

            if (isLikelySequenceItem(item)) {
                sequences.push(item);
            } else {
                files.push(item);
            }
        }

        return {
            files: files,
            sequences: sequences
        };
    }

    function buildSearchTargets(fileItems, seqItems, thoroughMode) {
        var fileMap = {};
        var seqMap = {};
        var activeSequenceGroups = {};
        var unresolvedFileCount = 0;
        var unresolvedSeqCount = 0;

        for (var i = 0; i < fileItems.length; i++) {
            var fileItem = fileItems[i];
            var fileTarget = {
                id: String(fileItem.id),
                item: fileItem,
                found: false,
                candidates: []
            };

            var nameKey = normalizeName(fileItem.name);
            if (nameKey) {
                uniquePush(fileTarget.candidates, nameKey);
            }

            if (thoroughMode) {
                var originalBase = "";
                try {
                    originalBase = normalizeName(safeBasenameFromFile(fileItem.mainSource ? fileItem.mainSource.file : null));
                } catch (e1) {}

                if (originalBase) {
                    uniquePush(fileTarget.candidates, originalBase);
                }
            }

            if (fileTarget.candidates.length > 0) {
                unresolvedFileCount++;
                for (var c1 = 0; c1 < fileTarget.candidates.length; c1++) {
                    addMapEntry(fileMap, fileTarget.candidates[c1], fileTarget);
                    addSequenceGroupKey(activeSequenceGroups, fileTarget.candidates[c1]);
                }
            }
        }

        for (var j = 0; j < seqItems.length; j++) {
            var seqItem = seqItems[j];
            var seqTarget = {
                id: String(seqItem.id),
                item: seqItem,
                found: false,
                candidates: []
            };

            var originalSeqBase = "";
            try {
                originalSeqBase = normalizeName(safeBasenameFromFile(seqItem.mainSource ? seqItem.mainSource.file : null));
            } catch (e2) {}

            if (originalSeqBase) {
                uniquePush(seqTarget.candidates, originalSeqBase);
            }

            var seqCandidate = normalizeName(buildFirstFrameNameFromDisplay(seqItem.name));
            if (seqCandidate) {
                uniquePush(seqTarget.candidates, seqCandidate);
            }

            if (seqTarget.candidates.length > 0) {
                unresolvedSeqCount++;
                for (var c2 = 0; c2 < seqTarget.candidates.length; c2++) {
                    addMapEntry(seqMap, seqTarget.candidates[c2], seqTarget);
                    addSequenceGroupKey(activeSequenceGroups, seqTarget.candidates[c2]);
                }
            }
        }

        return {
            fileMap: fileMap,
            seqMap: seqMap,
            activeSequenceGroups: activeSequenceGroups,
            unresolvedFileCount: unresolvedFileCount,
            unresolvedSeqCount: unresolvedSeqCount
        };
    }

    function isMac() {
        return $.os.toLowerCase().indexOf("mac") !== -1;
    }

    function shouldSkipFolder(folderObj, isRootFolder) {
        var name = "";
        var lower = "";

        if (!folderObj || !(folderObj instanceof Folder)) {
            return true;
        }

        if (!folderObj.exists) {
            return true;
        }

        try {
            if (!isRootFolder && folderObj.alias) {
                return true;
            }
        } catch (e1) {}

        try {
            name = folderObj.name || "";
            lower = name.toLowerCase();
        } catch (e2) {}

        if (!isRootFolder) {
            if (!name) {
                return false;
            }

            if (name.charAt(0) === ".") {
                return true;
            }

            if (name.charAt(0) === "$") {
                return true;
            }

            if (lower === "system volume information") {
                return true;
            }

            if (lower === "$recycle.bin") {
                return true;
            }

            if (lower === "recycler") {
                return true;
            }

            if (lower === "recycled") {
                return true;
            }

            if (isMac() && /\.app$/i.test(name)) {
                return true;
            }
        }

        return false;
    }

    function tryRelinkNormalTargets(targetList, fileObj, results) {
        for (var i = 0; i < targetList.length; i++) {
            var target = targetList[i];

            if (target.found) {
                continue;
            }

            try {
                if (target.item.footageMissing) {
                    target.item.replace(fileObj);
                    target.found = true;
                    results.filesFound++;
                    results.remainingFiles--;
                }
            } catch (e) {}
        }
    }

    function tryRelinkSequenceTargets(targetList, fileObj, results) {
        for (var i = 0; i < targetList.length; i++) {
            var target = targetList[i];

            if (target.found) {
                continue;
            }

            try {
                if (target.item.footageMissing) {
                    target.item.replaceWithSequence(fileObj, false);
                    target.found = true;
                    results.sequencesFound++;
                    results.remainingSequences--;
                }
            } catch (e) {}
        }
    }

    // Skip large frame runs that cannot possibly match any requested sequence.
    function getSkippableSequenceRunEnd(entries, startIndex, activeSequenceGroups) {
        var firstEntry = entries[startIndex];
        var firstDescriptor;
        var nextEntry;
        var nextDescriptor;
        var endIndex = startIndex;

        if (!firstEntry || firstEntry instanceof Folder) {
            return -1;
        }

        firstDescriptor = parseSequenceDescriptor(firstEntry.name || firstEntry.displayName || "");
        if (!firstDescriptor) {
            return -1;
        }

        if (activeSequenceGroups[firstDescriptor.key]) {
            return -1;
        }

        while (endIndex + 1 < entries.length) {
            nextEntry = entries[endIndex + 1];
            if (nextEntry instanceof Folder) {
                break;
            }

            nextDescriptor = parseSequenceDescriptor(nextEntry.name || nextEntry.displayName || "");
            if (!nextDescriptor || nextDescriptor.key !== firstDescriptor.key) {
                break;
            }

            endIndex++;
        }

        if (endIndex - startIndex + 1 > SEQUENCE_SKIP_THRESHOLD) {
            return endIndex;
        }

        return -1;
    }

    function scanAndRelink(rootFolder, searchTargets) {
        var stack = [{
            folder: rootFolder,
            isRoot: true
        }];
        var results = {
            filesFound: 0,
            sequencesFound: 0,
            remainingFiles: searchTargets.unresolvedFileCount,
            remainingSequences: searchTargets.unresolvedSeqCount,
            foldersScanned: 0,
            filesScanned: 0,
            errors: 0
        };

        while (stack.length > 0) {
            if (results.remainingFiles <= 0 && results.remainingSequences <= 0) {
                break;
            }

            var stackEntry = stack.pop();
            var folderObj = stackEntry.folder;
            var entries;

            try {
                entries = folderObj.getFiles();
                entries.sort(compareEntriesByName);
            } catch (e1) {
                results.errors++;
                continue;
            }

            results.foldersScanned++;

            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];

                if (results.remainingFiles <= 0 && results.remainingSequences <= 0) {
                    break;
                }

                if (entry instanceof Folder) {
                    if (!shouldSkipFolder(entry, false)) {
                        stack.push({
                            folder: entry,
                            isRoot: false
                        });
                    }
                    continue;
                }

                results.filesScanned++;

                var skipRunEnd = getSkippableSequenceRunEnd(entries, i, searchTargets.activeSequenceGroups);
                if (skipRunEnd > i) {
                    results.filesScanned += skipRunEnd - i;
                    i = skipRunEnd;
                    continue;
                }

                var keyName = normalizeName(entry.name);
                var displayKey = normalizeName(entry.displayName);

                if (results.remainingFiles > 0) {
                    var normalTargets = searchTargets.fileMap[keyName];
                    if (!normalTargets && displayKey && displayKey !== keyName) {
                        normalTargets = searchTargets.fileMap[displayKey];
                    }
                    if (normalTargets) {
                        tryRelinkNormalTargets(normalTargets, entry, results);
                    }
                }

                if (results.remainingSequences > 0) {
                    var seqTargets = searchTargets.seqMap[keyName];
                    if (!seqTargets && displayKey && displayKey !== keyName) {
                        seqTargets = searchTargets.seqMap[displayKey];
                    }
                    if (seqTargets) {
                        tryRelinkSequenceTargets(seqTargets, entry, results);
                    }
                }
            }
        }

        return results;
    }

    function getThoroughMode() {
        try {
            var kb = ScriptUI.environment.keyboardState;
            return !!(kb.metaKey || kb.ctrlKey);
        } catch (e) {
            return false;
        }
    }

    function buildSummary(results, totalRequested, thoroughMode, searchFolder) {
        var totalFound = results.filesFound + results.sequencesFound;
        var message = totalFound + " out of " + totalRequested + " clips relinked successfully.";

        message += "\n\nSearch folder:\n" + (searchFolder.fsName || searchFolder.fullName || searchFolder.name);

        if (results.filesFound > 0 || results.sequencesFound > 0) {
            message += "\n\nFiles: " + results.filesFound;
            message += "\nSequences: " + results.sequencesFound;
        }

        if (results.remainingFiles > 0 || results.remainingSequences > 0) {
            message += "\n\nNot found:";
            message += "\nFiles: " + results.remainingFiles;
            message += "\nSequences: " + results.remainingSequences;
        }

        message += "\n\nScanned " + results.filesScanned + " files in " + results.foldersScanned + " folders.";

        if (thoroughMode) {
            message += "\n\nThorough mode was used.";
        }

        if (results.errors > 0) {
            message += "\n\nSkipped / inaccessible folders: " + results.errors;
        }

        return message;
    }

    if (!app.project) {
        alert("No project is open.");
        return;
    }

    var selection = getSelectedMissingFootage();
    var totalRequested = selection.files.length + selection.sequences.length;
    if (totalRequested === 0) {
        alert("Select one or more missing Footage items in the Project panel.");
        return;
    }

    var searchFolder = Folder.selectDialog("Choose folder to search for missing footage:");
    if (!searchFolder) {
        return;
    }

    if (!searchFolder.exists || shouldSkipFolder(searchFolder, true)) {
        alert("That folder is not available.");
        return;
    }

    var thoroughMode = getThoroughMode();
    var searchTargets = buildSearchTargets(selection.files, selection.sequences, thoroughMode);

    if (searchTargets.unresolvedFileCount === 0 && searchTargets.unresolvedSeqCount === 0) {
        alert("None of the selected items produced valid search names.");
        return;
    }

    var results;
    app.beginUndoGroup(SCRIPT_NAME);
    try {
        results = scanAndRelink(searchFolder, searchTargets);
    } finally {
        app.endUndoGroup();
    }

    alert(buildSummary(results, totalRequested, thoroughMode, searchFolder));
})();
