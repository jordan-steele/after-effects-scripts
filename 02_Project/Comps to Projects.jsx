/**
 * @name Comps to Projects
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Saves each selected composition as a separate reduced .aep in a chosen output folder
 * @label CMP > PRJ
 * @changelog New: New script to split comps into projects
 */

(function CompsToProjects() {
    // -------------------------
    // Helpers
    // -------------------------

    function sanitizeName(name) {
        return name.replace(/[\\\/:\*\?"<>\|]/g, "_");
    }

    function getUniqueFile(folder, baseName) {
        var safe = sanitizeName(baseName);
        var f = new File(folder.fsName + "/" + safe + ".aep");
        if (!f.exists) {
            return f;
        }
        var n = 1;
        while (true) {
            f = new File(folder.fsName + "/" + safe + "_" + n + ".aep");
            if (!f.exists) {
                return f;
            }
            n++;
        }
    }

    function getSelectedComps() {
        if (!app.project) {
            return [];
        }
        var sel = app.project.selection || [];
        var comps = [];
        for (var i = 0; i < sel.length; i++) {
            if (sel[i] instanceof CompItem) {
                comps.push(sel[i]);
            }
        }
        return comps;
    }

    // -------------------------
    // Main
    // -------------------------

    if (!app.project) {
        alert("No project is open.");
        return;
    }
    if (!app.project.file) {
        alert("Please save the project before running Comps to Projects.");
        return;
    }

    var comps = getSelectedComps();
    if (!comps.length) {
        alert("Select one or more compositions in the Project panel first.");
        return;
    }

    var outputFolder = Folder.selectDialog("Choose output folder for saved projects");
    if (!outputFolder || !outputFolder.exists) {
        return;
    }

    // Snapshot ID and name before any project switching invalidates references.
    var compSnapshots = [];
    var i;
    for (i = 0; i < comps.length; i++) {
        compSnapshots.push({
            id: comps[i].id,
            name: comps[i].name
        });
    }

    // Save once so the original on disk is current.
    app.project.save();
    var originalPath = app.project.file.absoluteURI;

    var succeeded = 0;
    var failed = [];

    for (i = 0; i < compSnapshots.length; i++) {
        var snap = compSnapshots[i];

        try {
            // 1. Reopen the original fresh for each comp (openFast avoids UI overhead).
            app.openFast(File(originalPath));

            if (!app.project) {
                throw new Error("Project failed to open.");
            }

            // 2. Find the target comp by ID.
            var targetComp = app.project.itemByID(snap.id);
            if (!targetComp) {
                throw new Error("Comp not found (ID " + snap.id + ").");
            }

            // 3. Save-as to the output path — this is what creates the reduced copy.
            var outFile = getUniqueFile(outputFolder, snap.name);
            app.project.save(outFile);

            // 4. Reduce to just this comp and its dependencies.
            app.project.reduceProject([targetComp]);

            // 5. Save the reduced project.
            app.project.save();

            // 6. Close the reduced copy without saving further changes.
            app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);

            succeeded++;
        } catch (e) {
            failed.push("\u201c" + snap.name + "\u201d: " + e.message);
            // Attempt to recover a clean state before next iteration.
            try {
                app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
            } catch (ex) {}
        }
    }

    // Return to the original project.
    try {
        app.openFast(File(originalPath));
    } catch (e) {
        alert("Warning: could not reopen original project.\n" + e.message);
    }

    var msg = succeeded + " of " + compSnapshots.length + " project(s) saved to:\n" + outputFolder.fsName;
    if (failed.length) {
        msg += "\n\nFailed:\n" + failed.join("\n");
    }
    alert(msg);
})();
