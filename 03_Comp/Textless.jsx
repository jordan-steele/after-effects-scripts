/**
 * @name Textless
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Recursively hide text layers
 * @label TXTLSS
 * @shift-click Duplicate comp and nested comps, hiding text layers in all
 * @changelog Update: Open textless comps
 */

(function textlessHideTextLayers() {
    app.beginUndoGroup("Make Textless Version");

    var duplicatedComps = {};

    function hideTextLayersInComp(comp, isRoot) {
        if (comp && comp instanceof CompItem) {
            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);

                if (layer instanceof TextLayer) {
                    if (!(isRoot && layer.inPoint === 0 && layer.outPoint - layer.inPoint === comp.frameDuration)) {
                        layer.enabled = false;
                    }
                }

                if (layer instanceof AVLayer && layer.source instanceof CompItem) {
                    hideTextLayersInComp(layer.source, false);
                }
            }
        }
    }

    function duplicateAndHideText(comp, parentFolder, isRoot) {
        if (duplicatedComps[comp.id]) {
            return duplicatedComps[comp.id];
        }

        var dupComp = comp.duplicate();
        dupComp.name = comp.name + "_textless";
        if (isRoot) {
            dupComp.parentFolder = parentFolder.parentFolder;
        } else {
            dupComp.parentFolder = parentFolder;
        }

        duplicatedComps[comp.id] = dupComp;

        for (var i = 1; i <= dupComp.numLayers; i++) {
            var layer = dupComp.layer(i);

            if (layer instanceof TextLayer) {
                if (!(isRoot && layer.inPoint === 0 && layer.outPoint - layer.inPoint === dupComp.frameDuration)) {
                    layer.enabled = false;
                }
            }

            if (layer instanceof AVLayer && layer.source instanceof CompItem) {
                var nestedDupComp = duplicateAndHideText(layer.source, parentFolder, false);
                layer.replaceSource(nestedDupComp, false);
            }
        }

        return dupComp;
    }

    var comp = app.project.activeItem;

    if (comp && comp instanceof CompItem) {
        if (ScriptUI.environment.keyboardState.shiftKey) {
            var folder = app.project.items.addFolder(comp.name + "_textless comps");
            try {
                folder.parentFolder = comp.parentFolder;
            } catch (err) {}

            var originalTime = comp.time;
            var rootDupComp = duplicateAndHideText(comp, folder, true);

            if (rootDupComp) {
                rootDupComp.openInViewer();
                rootDupComp.time = originalTime;
            }

            if (folder.numItems === 0) {
                folder.remove();
            }

            alert("Duplicated nested compositions with text layers hidden.");
        } else {
            hideTextLayersInComp(comp, true);
            alert("Text layers hidden in the active composition.");
        }
    } else {
        alert("Please select a valid composition to process.");
    }

    app.endUndoGroup();
})();
