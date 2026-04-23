/**
 * @name Curves
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Apply curves
 * @label CURVES
 * @shift-click New adjustment layer with curves
 */

(function curves() {
    var layerName = "Curves";

    function applyEffect() {
        mySolid.Effects.addProperty("ADBE CurvesCustom");
    }

    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    var selectedLayer = myComp.selectedLayers[0];
    app.beginUndoGroup("Add " + layerName);
    var mySolid;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
            mySolid = myComp.layers.addSolid([1, 1, 1], layerName, myComp.width, myComp.height, myComp.pixelAspect, myComp.duration - myComp.time);
            mySolid.startTime = myComp.time;
        } else {
            mySolid = myComp.layers.addSolid([1, 1, 1], layerName, myComp.width, myComp.height, myComp.pixelAspect, myComp.duration);
            mySolid.startTime = 0;
        }
        applyEffect();
        mySolid.adjustmentLayer = true;
        mySolid.label = 5;
        try {
            mySolid.moveBefore(selectedLayer);
        } catch (err) {}
    } else if (myComp && myComp.selectedLayers.length > 0) {
        for (var i = 0; i < myComp.selectedLayers.length; i++) {
            mySolid = myComp.selectedLayers[i];
            applyEffect();
        }
    } else {
        alert("At least one layer needs to be selected. \n\nShift-Click will result in the effect being applied to an Adjustment Layer.\n\nShift-Cmd-Click will result in an Adjustment layer beginning at the current time.");
    }
    app.endUndoGroup();
})();
