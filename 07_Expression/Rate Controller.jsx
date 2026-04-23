/**
 * @name Rate Controller
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Expression
 * @description Adds a Rate Controller effect and expression to give a constant rate of time * multiplier
 * @label RATE
 */

(function rateController() {
    var composition = app.project.activeItem;
    if (!composition || !(composition instanceof CompItem)) {
        return alert("Please select composition first.");
    }

    var layer = composition.selectedLayers[0];
    if (!layer) {
        return alert("Please select a layer.");
    }

    var selProps = composition.selectedProperties;
    if (!selProps) {
        return alert("Please select a specific property.");
    }

    var saves = [];
    var prop;

    for (var p = 0; p < selProps.length; p++) {
        prop = selProps[p];
        if (prop.canSetExpression) {
            if (prop.propertyDepth > 2 && prop.propertyGroup(prop.propertyDepth - 2).isEffect) {
                saves.push(getPropIndexPath(prop));
            } else {
                saves.push(prop);
            }
        }
    }

    var effectsProp = layer.property("ADBE Effect Parade");
    var slider = effectsProp.addProperty("ADBE Slider Control");
    slider.name = "Degrees Per Second";
    slider.property("Slider").setValue(90);
    var expression = 'time*effect("Degrees Per Second")("Slider")';

    for (var s = 0; s < saves.length; s++) {
        prop = saves[s] instanceof Property ? saves[s] : getPropFromIndexPath(layer, saves[s]);
        try {
            prop.expression = expression;
        } catch (e) {
            alert(e);
        }
    }

    function getPropIndexPath(prop) {
        var indices = [];
        while (prop.propertyDepth > 0) {
            indices.unshift(prop.propertyIndex);
            prop = prop.parentProperty;
        }
        indices.unshift(prop.index);
        return indices;
    }

    function getPropFromIndexPath(layer, indexPath) {
        var prop = layer,
            n = 0,
            N = indexPath.length;
        while (++n < N && (prop = prop.property(indexPath[n]))) {}
        return prop;
    }
})();
