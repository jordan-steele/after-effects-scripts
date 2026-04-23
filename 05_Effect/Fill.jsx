/**
 * @name Fill
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Fill selected layers with black
 * @label FILL
 * @shift-click Fill selected layers with white
 * @cmd-click Apply invert effect to select layers
 */

(function fill() {
    var comp;
    var layer;
    var fx;
    var i;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        app.beginUndoGroup("Add White Fill");
        comp = app.project.activeItem;
        if (comp == null) {
            alert("Please select an active comp");
            return;
        }
        if (comp && comp.selectedLayers.length > 0) {
            for (i = 0; i < comp.selectedLayers.length; i++) {
                layer = comp.selectedLayers[i];
                fx = layer.Effects.addProperty("ADBE Fill");
                fx.name = "Fill";
                fx.property(String("ADBE Fill-0002")).setValue([1, 1, 1, 1]);
            }
        } else {
            alert("You need at least one selected layer");
        }
    } else if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        app.beginUndoGroup("Invert");
        comp = app.project.activeItem;
        if (comp == null) {
            alert("Please select an active comp");
            return;
        }
        if (comp && comp.selectedLayers.length > 0) {
            for (i = 0; i < comp.selectedLayers.length; i++) {
                layer = comp.selectedLayers[i];
                fx = layer.Effects.addProperty("ADBE Invert");
                fx.name = "Invert";
            }
        } else {
            alert("You need at least one selected layer");
        }
    } else {
        app.beginUndoGroup("Add Black Fill");
        comp = app.project.activeItem;
        if (comp == null) {
            alert("Please select an active comp");
            return;
        }
        if (comp && comp.selectedLayers.length > 0) {
            for (i = 0; i < comp.selectedLayers.length; i++) {
                layer = comp.selectedLayers[i];
                fx = layer.Effects.addProperty("ADBE Fill");
                fx.name = "Fill";
                fx.property(String("ADBE Fill-0002")).setValue([0, 0, 0, 1]);
            }
        } else {
            alert("You need at least one selected layer");
        }
    }
})();
