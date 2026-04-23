/**
 * @name Reset Layer Effects
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Reset layer controls for all effects on selected layers
 * @label RESET
 * @shift-click Reset layer controls for all effects on all layers
 */

(function reverseLayers() {
    function processLayers(layers, isAllLayers) {
        var numLayers = isAllLayers ? layers.length : layers.length + 1;
        for (var i = 1; i < numLayers; i++) {
            var layer = isAllLayers ? layers[i] : layers[i - 1];
            processEffects(layer, layer.index);
        }
    }

    // Function to process effects
    function processEffects(layer, layerIndex) {
        if (layer.Effects != undefined) {
            var effects = layer.Effects;
            for (var j = 1; j <= effects.numProperties; j++) {
                var effect = effects.property(j);
                for (var k = 1; k <= effect.numProperties; k++) {
                    var prop = effect.property(k);
                    if (prop.propertyValueType === PropertyValueType.LAYER_INDEX) {
                        prop.setValue(layerIndex);
                    }
                }
            }
        }
    }

    function main() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var shiftHeld = false;
        if (ScriptUI.environment.keyboardState.shiftKey) {
            shiftHeld = true;
        }

        app.beginUndoGroup("Reset Layer Index Properties");

        if (shiftHeld) {
            processLayers(comp.layers, true);
        } else {
            processLayers(comp.selectedLayers, false);
        }

        app.endUndoGroup();
    }
    main();
})();
