/**
 * @name Smooth Expression
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Expression
 * @description Apply smoothing expression to selected properties
 * @label SMOOTH
 * @changelog New: New script to apply a smoothing expression. Original script by Harrison Lee.
 */

(function hl_smoothexpression() {
    function generateSmoothingExpression(sliderReference) {
        return [
            "var smoothAmount = " + sliderReference + ";",
            "if (smoothAmount > 0 && numKeys > 1) {",
            "    var t = time;",
            "    var windowSize = smoothAmount;",
            "    var sum = value instanceof Array ? value.map(function() { return 0; }) : 0;",
            "    var count = 0;",
            "    var startKey = nearestKey(t - windowSize).index;",
            "    var endKey = nearestKey(t + windowSize).index;",
            "    // Adjust start key if necessary",
            "    if (key(startKey).time < t - windowSize && startKey < numKeys) {",
            "        startKey++;",
            "    }",
            "    // Adjust end key if necessary",
            "    if (key(endKey).time > t + windowSize && endKey > 1) {",
            "        endKey--;",
            "    }",
            "    for (var i = startKey; i <= endKey; i++) {",
            "        var keyTime = key(i).time;",
            "        var weight = Math.max(0, 1 - Math.abs(t - keyTime) / windowSize);",
            "        if (weight > 0) {",
            "            var keyValue = valueAtTime(keyTime);",
            "            if (sum instanceof Array) {",
            "                for (var j = 0; j < sum.length; j++) {",
            "                    sum[j] += keyValue[j] * weight;",
            "                }",
            "            } else {",
            "                sum += keyValue * weight;",
            "            }",
            "            count += weight;",
            "        }",
            "    }",
            "    if (count > 0) {",
            "        if (sum instanceof Array) {",
            "            for (var i = 0; i < sum.length; i++) {",
            "                sum[i] /= count;",
            "            }",
            "        } else {",
            "            sum /= count;",
            "        }",
            "        sum;",
            "    } else {",
            "        value;",
            "    }",
            "} else {",
            "    value;",
            "}"
        ].join("\n");
    }

    // Function to add or get existing slider effect
    function addOrGetSliderEffect(layer, sliderName) {
        var sliderEffect = layer.effect(sliderName);
        if (!sliderEffect) {
            sliderEffect = layer.Effects.addProperty("ADBE Slider Control");
            sliderEffect.name = sliderName;
            sliderEffect.property("Slider").setValue(1);
        }
        return sliderEffect;
    }

    function smoothingScript() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition first.");
            return;
        }

        var selectedProps = comp.selectedProperties;
        if (selectedProps.length === 0) {
            alert("Please select a property to apply the smoothing expression.");
            return;
        }

        app.beginUndoGroup("Apply Smoothing Expression");

        for (var i = 0; i < selectedProps.length; i++) {
            var prop = selectedProps[i];
            if (prop.canSetExpression) {
                var layer = prop.propertyGroup(prop.propertyDepth);

                // Create a unique slider name based on the property name
                var propertyName = prop.name.replace(/\s+/g, ""); // Remove spaces from property name
                var sliderName = "Smooth Amount - " + propertyName;

                // Variable to hold the smoothing expression
                var smoothingExpression = "";
                var nullLayer = null;

                // Check if the layer is a Camera or Light, which cannot have effects
                if (layer instanceof CameraLayer || layer instanceof LightLayer) {
                    // Check if a null layer for controls already exists by its name
                    for (var j = 1; j <= comp.numLayers; j++) {
                        var compLayer = comp.layer(j);
                        if (compLayer.name === layer.name + "_SmoothingControls" && compLayer.nullLayer) {
                            nullLayer = compLayer; // Use existing null layer
                            break;
                        }
                    }

                    // If no existing null layer was found, create a new one
                    if (!nullLayer) {
                        nullLayer = comp.layers.addNull();
                        nullLayer.name = layer.name + "_SmoothingControls";
                    }

                    // Add the slider control to the null layer
                    addOrGetSliderEffect(nullLayer, sliderName);

                    // Create the smoothing expression that references the null layer's slider
                    smoothingExpression = generateSmoothingExpression("thisComp.layer('" + nullLayer.name + "').effect('" + sliderName + "')('Slider')");
                } else {
                    // For normal layers, add the slider directly to the layer
                    addOrGetSliderEffect(layer, sliderName);

                    // Create the smoothing expression that references the slider on the same layer
                    smoothingExpression = generateSmoothingExpression("effect('" + sliderName + "')('Slider')");
                }

                // Apply the expression to the selected property
                prop.expression = smoothingExpression;
            }
        }

        app.endUndoGroup();
    }

    smoothingScript();
})();
