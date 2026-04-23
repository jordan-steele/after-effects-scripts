/**
 * @name Reload Selected Layers
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Reload the file sources of selected layers if After Effects doesn't detect it automatically
 * @label RELOAD
 * @changelog Bug Fix: Fixed icon color
 */

(function reloadSelectedLayerSources() {
    var activeComp = app.project.activeItem;

    if (!activeComp || !(activeComp instanceof CompItem)) {
        alert("No active composition.");
        return;
    }

    var selectedLayers = activeComp.selectedLayers;

    if (selectedLayers.length === 0) {
        alert("No layers selected.");
        return;
    }

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (layer.source && layer.source.mainSource instanceof FileSource) {
            try {
                var file = layer.source.mainSource.file;
                layer.source.mainSource.reload();
            } catch (e) {
                alert("Failed to reload: " + file.name + "\nError: " + e.toString());
            }
        }
    }

    alert("Reloaded Selected Layers.");
})();
