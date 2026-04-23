/**
 * @name Count
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Alerts the number of selected items in the Project panel and selected layers in the active comp
 * @label COUNT
 */

(function count() {
    var projectCount = app.project.selection.length;

    var layerCount = 0;
    var activeComp = app.project.activeItem;
    if (activeComp && activeComp instanceof CompItem) {
        layerCount = activeComp.selectedLayers.length;
    }

    alert("Project selection: " + projectCount + "\nLayer selection: " + layerCount);
})();
