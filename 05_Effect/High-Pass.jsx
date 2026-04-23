/**
 * @name High-Pass
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Adds a set of effects with sliders for a high pass filter
 * @label HI-PASS
 * @shift-click Will add reduce noise and precomp before applying high pass
 */

(function hiPass() {
    app.beginUndoGroup("Add High Pass");

    var shiftHeld;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
    }

    var comp = app.project.activeItem;
    if (comp == null) {
        alert("Please select an active comp");
        return;
    }
    var selLayers = comp.selectedLayers;
    if (comp && selLayers.length > 0) {
        var fx;
        for (var i = 0; i < selLayers.length; i++) {
            var layer = selLayers[i];

            if (shiftHeld == true) {
                try {
                    fx = layer.Effects.addProperty("NeatVideo6A");
                    fx.name = "Reduce Noise v6";
                } catch (e) {
                    try {
                        fx = layer.Effects.addProperty("NeatVideo5A");
                        fx.name = "Reduce Noise v5";
                    } catch (e2) {
                        alert("Error: Neither NeatVideo 6 nor NeatVideo 5 is available. Please check if the plugin is installed.");
                        app.endUndoGroup();
                        return;
                    }
                }
                var newInPoint = layer.inPoint;
                var newCompName = "";
                var layerName = layer.name;
                if (layerName.length > 26) {
                    layerName = layerName.substring(0, 26);
                }
                newCompName += layerName;
                var layerIndices = new Array();
                layerIndices[layerIndices.length] = layer.index;
                var newComp = comp.layers.precompose(layerIndices, newCompName + ".RN", true);
                try {
                    for (var j = 1; 1 <= app.project.numItems; j++) {
                        if (app.project.item(j).name.search("precomps") != -1 && app.project.item(j) instanceof FolderItem) {
                            newComp.parentFolder = app.project.item(j);
                            break;
                        }
                    } //for
                } catch (err) {}
                var preCompLayer = comp.selectedLayers[0];
                preCompLayer.inPoint = newInPoint;
                layer = preCompLayer;
            }

            fx = layer.Effects.addProperty("ADBE Slider Control");
            fx.name = "BLUR";
            try {
                fx.property(String("ADBE Slider Control-0001")).setValue([20]);
            } catch (e) {}
            fx = layer.Effects.addProperty("ADBE Slider Control");
            fx.name = "HIGH";
            try {
                fx.property(String("ADBE Slider Control-0001")).setValue([55]);
            } catch (e) {}
            fx = layer.Effects.addProperty("ADBE Slider Control");
            fx.name = "MID";
            try {
                fx.property(String("ADBE Slider Control-0001")).setValue([50]);
            } catch (e) {}
            fx = layer.Effects.addProperty("ADBE Slider Control");
            fx.name = "LOW";
            try {
                fx.property(String("ADBE Slider Control-0001")).setValue([45]);
            } catch (e) {}
            fx = layer.Effects.addProperty("ADBE Gaussian Blur 2");
            try {
                fx.property(String("ADBE Gaussian Blur 2-0001")).expression = 'effect("BLUR")("Slider")';
            } catch (e) {}
            try {
                fx.property(String("ADBE Gaussian Blur 2-0003")).setValue([1]);
            } catch (e) {}
            fx = layer.Effects.addProperty("ADBE Invert");
            fx = layer.Effects.addProperty("CC Composite");
            try {
                fx.property(String("CC Composite-0001")).setValue([50]);
            } catch (e) {}
            fx = layer.Effects.addProperty("ADBE Pro Levels2");
            try {
                fx.property(String("ADBE Pro Levels2-0004")).expression = 'effect("LOW")("Slider")/100';
            } catch (e) {}
            try {
                fx.property(String("ADBE Pro Levels2-0005")).expression = 'effect("HIGH")("Slider")/100';
            } catch (e) {}
            try {
                fx.property(String("ADBE Pro Levels2-0006")).expression = 'effect("MID")("Slider")/50';
            } catch (e) {}
        }
    } else {
        alert("You need at least one selected layer");
    }
})();
