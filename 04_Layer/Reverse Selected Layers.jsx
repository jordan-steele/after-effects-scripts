/**
 * @name Reverse Layers
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Reverse selected layers
 * @label RVRSE
 */

(function reverseLayers() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
    } else {
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("No layers selected.");
        } else {
            app.beginUndoGroup("Reverse Layer Order");
            var reverse = false;

            var firstLayer = selectedLayers[0].index;
            if (selectedLayers[0].index > selectedLayers[1].index) {
                reverse = true;
            }
            for (var i = 1; i < selectedLayers.length; i++) {
                if (reverse) {
                    selectedLayers[i].moveAfter(comp.layer(firstLayer));
                } else {
                    selectedLayers[i].moveBefore(comp.layer(firstLayer));
                }
            }

            app.endUndoGroup();
        }
    }
})();
