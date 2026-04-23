/**
 * @name Create Mattes
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Create matte comp by filling selected layers with white and other layers with black
 * @label MATTE
 * @shift-click Duplicates comp first and adds "_matte"
 * @changelog Update: Set opacity to 100%
 */

(function createMattes() {
    var shiftKeyPressed = ScriptUI.environment.keyboardState.shiftKey;
    var i;

    app.beginUndoGroup("Create Mattes");

    var originalComp = app.project.activeItem;
    if (!(originalComp instanceof CompItem)) {
        alert("Please select a composition.");
        app.endUndoGroup();
        return;
    }

    // Store selected layer indexes before any modification
    var selectedLayerIndexes = {};
    var selectedLayerCount = 0;
    for (i = 0; i < originalComp.selectedLayers.length; i++) {
        selectedLayerIndexes[originalComp.selectedLayers[i].index] = true;
        selectedLayerCount++;
    }

    if (selectedLayerCount === 0) {
        alert("Please select at least one layer.");
        app.endUndoGroup();
        return;
    }

    var comp;
    if (shiftKeyPressed) {
        // Duplicate the composition
        comp = originalComp.duplicate();
        comp.name = originalComp.name + "_matte";

        // Make the duplicated comp active
        comp.openInViewer();
        comp.time = originalComp.time;
    } else {
        comp = originalComp;
    }

    // Reselect layers in the active composition
    for (i = 1; i <= comp.numLayers; i++) {
        comp.layer(i).selected = !!selectedLayerIndexes[i];
    }

    var selectedLayers = comp.selectedLayers;

    // Sort selected layers by index (bottom to top)
    selectedLayers.sort(function (a, b) {
        return a.index - b.index;
    });

    function normalizeOpacity(layer) {
        try {
            var opacityProp = layer.property("ADBE Transform Group").property("ADBE Opacity");
            if (!opacityProp) {
                return;
            }

            if (opacityProp.numKeys === 0) {
                opacityProp.setValue(100);
                return;
            }

            var maxVal = -999999;
            var keyValues = [];
            var k;

            // Gather key values and find max
            for (k = 1; k <= opacityProp.numKeys; k++) {
                var val = opacityProp.keyValue(k);
                keyValues.push(val);
                if (val > maxVal) {
                    maxVal = val;
                }
            }

            // Avoid divide-by-zero case
            if (maxVal <= 0) {
                for (k = 1; k <= opacityProp.numKeys; k++) {
                    opacityProp.setValueAtKey(k, 0);
                }
                return;
            }

            // Scale all keys so the highest becomes 100
            for (k = 1; k <= opacityProp.numKeys; k++) {
                var normalizedVal = (keyValues[k - 1] / maxVal) * 100;
                opacityProp.setValueAtKey(k, normalizedVal);
            }
        } catch (err) {
            // Ignore layers that don't expose opacity normally
        }
    }

    // Add white fill to selected layers + normalize opacity
    for (i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];

        normalizeOpacity(layer);

        if (layer.blendingMode !== undefined) {
            layer.blendingMode = BlendingMode.NORMAL;
        }

        var whiteFill = layer.Effects.addProperty("ADBE Fill");
        whiteFill.property("ADBE Fill-0002").setValue([1, 1, 1, 1]);
    }

    // Add black solid underneath
    var blackSolid = comp.layers.addSolid([0, 0, 0], "Black Solid", comp.width, comp.height, comp.pixelAspect, comp.duration);
    blackSolid.moveAfter(selectedLayers[selectedLayers.length - 1]);

    // Add black fill to layers above the solid, with exceptions
    for (var j = 1; j <= comp.numLayers; j++) {
        var otherLayer = comp.layer(j);
        if (otherLayer.index < blackSolid.index) {
            if (
                !selectedLayerIndexes[otherLayer.index] &&
                !(otherLayer.adjustmentLayer === true) &&
                !(otherLayer.startTime === 0 && otherLayer.outPoint - otherLayer.inPoint === comp.frameDuration) &&
                otherLayer instanceof AVLayer &&
                otherLayer.enabled === true
            ) {
                var blackFill = otherLayer.Effects.addProperty("ADBE Fill");
                blackFill.property("ADBE Fill-0002").setValue([0, 0, 0, 1]);
            }
        }
    }

    // Disable guide layers
    for (var n = 1; n <= comp.numLayers; n++) {
        var guideTestLayer = comp.layer(n);
        if (guideTestLayer.guideLayer) {
            guideTestLayer.enabled = false;
        }
    }

    app.endUndoGroup();
})();
