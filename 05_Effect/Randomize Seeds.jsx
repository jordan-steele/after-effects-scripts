/**
 * @name Randomize Seeds
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Randomize random seed properties of all effects of selected layers
 * @label RANDOM
 * @changelog Update: Randomize all layers if no layers are selected. Removed alert after randomization. Randomizes any property with 'seed' in the name.
 */

(function () {
    function changeRandomSeeds() {
        var comp = app.project.activeItem;
        var i;

        if (!(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;

        app.beginUndoGroup("Change Random Seeds");

        var layer;
        if (selectedLayers.length > 0) {
            for (i = 0; i < selectedLayers.length; i++) {
                layer = selectedLayers[i];
                searchAndChangeSeeds(layer);
            }
        } else {
            for (i = 1; i <= comp.layers.length; i++) {
                layer = comp.layers[i];
                searchAndChangeSeeds(layer);
            }
        }

        app.endUndoGroup();
    }

    function searchAndChangeSeeds(layer) {
        for (var j = 1; j <= layer.Effects.numProperties; j++) {
            var effect = layer.Effects.property(j);
            searchEffectProperties(effect);
        }
    }

    function searchEffectProperties(propGroup) {
        for (var k = 1; k <= propGroup.numProperties; k++) {
            var prop = propGroup.property(k);

            if (prop.propertyType === PropertyType.PROPERTY && prop.propertyValueType !== PropertyValueType.NO_VALUE) {
                if (prop.name.toLowerCase().indexOf("seed") !== -1) {
                    var randomValue = Math.floor(Math.random() * 10000);
                    prop.setValue(randomValue);
                }
            } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                searchEffectProperties(prop);
            }
        }
    }

    changeRandomSeeds();
})();
