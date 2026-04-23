/**
 * @name Split Layer Masks
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Split a layer's masks into individual layers named after each mask
 * @icon-text SPLT MSK
 * @shift-click Split into grouped masks by name prefix instead
 */

(function splitLayerMasks() {
    var shiftHeld = ScriptUI.environment.keyboardState.shiftKey;

    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Please select a layer.");
        return;
    }
    if (selectedLayers.length > 1) {
        alert("Please select only one layer.");
        return;
    }

    var sourceLayer = selectedLayers[0];
    if (sourceLayer.mask.numProperties === 0) {
        alert("The selected layer has no masks.");
        return;
    }

    app.beginUndoGroup("Split Layer Masks");

    var i, k, newLayer, prefix;

    if (shiftHeld) {
        var seenPrefixes = {};
        for (i = 1; i <= sourceLayer.mask.numProperties; i++) {
            prefix = sourceLayer.mask(i).name.substring(0, 1);
            if (seenPrefixes[prefix]) {
                continue;
            }
            seenPrefixes[prefix] = true;

            newLayer = sourceLayer.duplicate();
            newLayer.name = "Group " + prefix + " Masks";
            for (k = newLayer.mask.numProperties; k > 0; k--) {
                if (newLayer.mask(k).name.substring(0, 1) !== prefix) {
                    newLayer.mask(k).remove();
                }
            }
        }
    } else {
        var maskNames = [];
        for (i = 1; i <= sourceLayer.mask.numProperties; i++) {
            maskNames.push(sourceLayer.mask(i).name);
        }
        for (i = 0; i < maskNames.length; i++) {
            newLayer = sourceLayer.duplicate();
            newLayer.name = maskNames[i];
            for (k = newLayer.mask.numProperties; k > 0; k--) {
                if (newLayer.mask(k).name !== maskNames[i]) {
                    newLayer.mask(k).remove();
                }
            }
        }
    }

    sourceLayer.remove();
    app.endUndoGroup();
})();
