/**
 * @name Reduce Noise
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Apply Neat Video's reduce noise v5
 * @label NEAT VID
 * @shift-click Precomp de-noise
 * @cmd-click Grain subtraction method
 * @changelog Update: Added grain subtraction noise method for command click
 */

(function reduceNoise() {
    var keyboardState = ScriptUI.environment.keyboardState;
    var precomp = false;
    var grainSubtract = false;

    if (keyboardState.shiftKey) {
        precomp = true;
    }
    if (keyboardState.metaKey || (File.fs == "Windows" && keyboardState.ctrlKey)) {
        grainSubtract = true;
    }

    function getSourceStartFrame(layer, comp) {
        var newLayer = layer.duplicate();
        var tempComp = comp.layers.precompose([newLayer.index], "TempTCPrecomp", false);
        var sourceStartFrame = tempComp.displayStartFrame;
        tempComp.remove();
        return sourceStartFrame;
    }

    function createPrecomp(comp, layers, precompName, moveAllAttributes) {
        try {
            if (!comp || !layers || layers.length === 0) {
                throw new Error("Invalid composition or layers provided");
            }

            var startIn = layers[0].startTime;

            // Create array of layer indices for precomposition
            var layerIndices = [];
            for (var i = 0; i < layers.length; i++) {
                layerIndices[i] = layers[i].index;
            }

            // Create the precomposition
            var preCompItem = comp.layers.precompose(layerIndices, precompName, moveAllAttributes);

            // Find the earliest inPoint and latest outPoint across all layers
            var precompLayers = preCompItem.layers;
            var groupIn = precompLayers[1].inPoint;
            var groupOut = precompLayers[1].outPoint;

            for (var k = 1; k <= precompLayers.length; k++) {
                if (precompLayers[k].inPoint < groupIn) {
                    groupIn = precompLayers[k].inPoint;
                }
                if (precompLayers[k].outPoint > groupOut) {
                    groupOut = precompLayers[k].outPoint;
                }
            }

            var groupDuration = groupOut - groupIn;

            // Set precomp properties
            preCompItem.duration = groupDuration;
            preCompItem.displayStartFrame = groupIn / preCompItem.frameDuration - startIn / comp.frameDuration + getSourceStartFrame(preCompItem.layer(1), preCompItem);
            preCompItem.parentFolder = comp.parentFolder;
            preCompItem.workAreaStart = 0;
            preCompItem.workAreaDuration = preCompItem.duration;

            // Get the resulting precomp layer in the main comp
            var preCompLayer = comp.selectedLayers[0];
            preCompLayer.startTime = groupIn;
            preCompLayer.inPoint = groupIn;
            preCompLayer.outPoint = groupOut;

            // Adjust layer timing within the precomp to account for the new timeline
            for (var j = 1; j <= preCompItem.layers.length; j++) {
                var layer = preCompItem.layer(j);
                var originalStartTime = layer.startTime;
                layer.startTime = originalStartTime - groupIn;
            }

            return {
                item: preCompItem,
                layer: preCompLayer
            };
        } catch (err) {
            alert(err);
            return null;
        }
    }

    function buildBaseName(layer) {
        var layerName = layer.name;
        var withoutSequence = layerName.replace(/\[[-\d]+\]/g, "");
        return withoutSequence.replace(/\.[\w]{2,5}$/, "");
    }

    function buildDenoiseName(layer) {
        var cleanName = buildBaseName(layer);
        return cleanName.replace(/([^._])$/, "$1.") + "DN";
    }

    function buildGrainName(layer) {
        return buildDenoiseName(layer) + " Grain";
    }

    function addReduceNoiseEffect(layer) {
        try {
            // Try NeatVideo6A first
            var fx = layer.Effects.addProperty("NeatVideo6A");
            fx.name = "Reduce Noise v6";
            return true;
        } catch (e) {
            // Fallback to NeatVideo5A if v6 isn't available
            try {
                var fallbackFx = layer.Effects.addProperty("NeatVideo5A");
                fallbackFx.name = "Reduce Noise v5";
                return true;
            } catch (e2) {
                // Neither version available
                alert("Error: Neither NeatVideo 6 nor NeatVideo 5 is available. Please check if the plugin is installed.");
                return false;
            }
        }
    }

    function prepareProjectForGrainSubtract() {
        if (app.project.colorManagementSystem === 0) {
            app.project.bitsPerChannel = 32;
        } else if (app.project.colorManagementSystem === 1) {
            alert("After Effects should be in 32 bits per channel to properly support the grain subtract method.");
        }
    }

    function clearLayerSelection(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            comp.layer(i).selected = false;
        }
    }

    function findLayerByComment(comp, comment) {
        for (var i = 1; i <= comp.numLayers; i++) {
            if (comp.layer(i).comment === comment) {
                return comp.layer(i);
            }
        }
        return null;
    }

    function findLayerBySource(comp, sourceItem) {
        for (var i = 1; i <= comp.numLayers; i++) {
            if (comp.layer(i).source === sourceItem) {
                return comp.layer(i);
            }
        }
        return null;
    }

    function buildDenoisePrecomp(layer) {
        var comp = layer.containingComp;
        clearLayerSelection(comp);
        layer.selected = true;

        var precompResult = createPrecomp(comp, [layer], buildDenoiseName(layer), true);
        if (!precompResult) {
            return null;
        }

        var preCompItem = precompResult.item;
        var topLayer = preCompItem.layer(1);

        if (!addReduceNoiseEffect(topLayer)) {
            return null;
        }

        return {
            item: preCompItem,
            layer: precompResult.layer,
            innerLayer: topLayer
        };
    }

    function applyGrainSubtract(layer) {
        var comp = layer.containingComp;
        var grainName = buildGrainName(layer);
        var marker = "__reduce_noise_grain_subtract__" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000000);
        var originalCopy = layer.duplicate();
        originalCopy.comment = marker;

        var denoiseResult = buildDenoisePrecomp(layer);
        if (!denoiseResult) {
            return false;
        }

        var denoiseLayer = denoiseResult.layer;
        var denoiseComp = denoiseResult.item;
        var denoiseInnerLayer = denoiseResult.innerLayer;

        clearLayerSelection(comp);
        originalCopy = findLayerByComment(comp, marker);
        if (!originalCopy) {
            return false;
        }

        originalCopy.comment = "";
        originalCopy.moveBefore(denoiseLayer);

        var nestedDenoiseLayer = denoiseLayer.duplicate();
        nestedDenoiseLayer.comment = marker;
        nestedDenoiseLayer.moveBefore(originalCopy);

        originalCopy.selected = true;
        nestedDenoiseLayer.selected = true;

        var grainResult = createPrecomp(comp, [nestedDenoiseLayer, originalCopy], grainName, true);
        if (!grainResult) {
            return false;
        }

        var grainComp = grainResult.item;
        var grainLayer = grainResult.layer;
        var nestedPrecompLayer = findLayerByComment(grainComp, marker);

        if (!nestedPrecompLayer) {
            nestedPrecompLayer = findLayerBySource(grainComp, denoiseComp);
        }

        if (!nestedPrecompLayer) {
            return false;
        }

        nestedPrecompLayer.comment = "";
        nestedPrecompLayer.blendingMode = BlendingMode.SUBTRACT;
        grainLayer.blendingMode = BlendingMode.ADD;
        grainLayer.moveBefore(denoiseLayer);

        try {
            denoiseComp.openInViewer();
        } catch (e) {}

        clearLayerSelection(denoiseComp);
        denoiseInnerLayer.selected = true;

        return true;
    }

    function applyEffect(layer) {
        var finalName = buildDenoiseName(layer);

        if (!addReduceNoiseEffect(layer)) {
            return false;
        }

        if (precomp == true) {
            createPrecomp(layer.containingComp, [layer], finalName, true);
        }

        return true;
    }

    //Begin running script
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    app.beginUndoGroup("Add Reduce Noise");
    if (myComp && myComp.selectedLayers.length > 0) {
        var successCount = 0;
        if (grainSubtract) {
            prepareProjectForGrainSubtract();
        }
        var selectedLayers = [];
        for (var s = 0; s < myComp.selectedLayers.length; s++) {
            selectedLayers.push(myComp.selectedLayers[s]);
        }

        selectedLayers.sort(function (a, b) {
            return b.index - a.index;
        });

        for (var i = 0; i < selectedLayers.length; i++) {
            var mySolid = selectedLayers[i];
            var success = grainSubtract ? applyGrainSubtract(mySolid) : applyEffect(mySolid);
            if (success) {
                successCount++;
            }
        }
        if (successCount === 0) {
            alert("Could not apply NeatVideo to any selected layers.");
        }
    } else {
        alert("At least one layer needs to be selected.");
    }
    app.endUndoGroup();
})();
