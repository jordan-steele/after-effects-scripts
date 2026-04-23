/**
 * @name Save Photo
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Saves current frame as PSD
 * @label PHOTO
 * @shift-click Saves JPEG (if template is available)
 * @cmd-click Saves PNG in the background to the desktop
 * @changelog Update: Added ability to process multiple selected in the project panel
 */

(function savePhoto() {
    app.beginUndoGroup("Save Current Frame");

    // Get compositions to process - either selected items or active item
    function getCompositionsToProcess() {
        var compositions = [];

        // Check if there are selected items in project panel
        if (app.project.selection && app.project.selection.length > 0) {
            for (var i = 0; i < app.project.selection.length; i++) {
                var item = app.project.selection[i];
                if (item instanceof CompItem) {
                    compositions.push(item);
                }
            }
        }

        // If no compositions selected, fall back to active item
        if (compositions.length === 0 && app.project.activeItem instanceof CompItem) {
            compositions.push(app.project.activeItem);
        }

        return compositions;
    }

    var compositions = getCompositionsToProcess();

    if (compositions.length === 0) {
        alert("Please select composition(s) in the project panel or make sure a composition is active");
        app.endUndoGroup();
        return;
    }

    var c;
    var result;
    try {
        if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
            // PNG SAVE - Cmd/Ctrl-click
            var savedCount = 0;
            for (c = 0; c < compositions.length; c++) {
                var compItem = compositions[c];

                /*String*/
                var filePngName = compItem.name || "Snapshot";
                /*int*/
                var compItemFrame = Math.floor(compItem.time / compItem.frameDuration);

                /*File*/
                var filePng = null;
                /*int*/
                var i = 1;
                while ((filePng = new File("~/Desktop/" + filePngName + " [f" + Array(5 - String(compItemFrame).length).join(0) + compItemFrame + "](" + i++ + ").png")).exists) {
                    continue;
                }

                compItem.saveFrameToPng(compItem.time, filePng);
                savedCount++;
            }
            alert("Screenshot(s) saved to Desktop (" + savedCount + " composition" + (savedCount > 1 ? "s" : "") + ")\nThis may take a little bit of time to finish.");
        } else if (ScriptUI.environment.keyboardState.shiftKey) {
            // JPEG SAVE - Shift-click
            var b;
            for (c = 0; c < compositions.length; c++) {
                var composition = compositions[c];
                composition.openInViewer();
                app.executeCommand(2104);

                var RStemplates = app.project.renderQueue.item(app.project.renderQueue.numItems).templates;
                var guideTemplate = null;
                for (b = 0; b < RStemplates.length; b++) {
                    result = RStemplates[b].match(/guide/i);
                    if (result) {
                        guideTemplate = RStemplates[b];
                    }
                }

                if (guideTemplate != null) {
                    app.project.renderQueue.item(app.project.renderQueue.numItems).applyTemplate(guideTemplate);
                } else {
                    app.project.renderQueue.item(app.project.renderQueue.numItems).applyTemplate("Best Settings");
                    app.project.renderQueue.item(app.project.renderQueue.numItems).setSetting("Guide Layers", "Current Settings");
                }

                var OMtemplates = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates;
                var jpegTemplate = null;
                for (b = 0; b < OMtemplates.length; b++) {
                    result = OMtemplates[b].match(/jpeg/i);
                    if (result) {
                        jpegTemplate = OMtemplates[b];
                    }
                }

                if (jpegTemplate != null) {
                    app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).applyTemplate(jpegTemplate);
                }
            }
        } else {
            // Process each selected composition for PSD save
            for (c = 0; c < compositions.length; c++) {
                var activeItem = compositions[c];
                activeItem.openInViewer(); // Make sure composition is open in viewer
                app.executeCommand(2104);
            }
        }
    } catch ($e) {
        alert($e);
    }

    app.endUndoGroup();
})();
