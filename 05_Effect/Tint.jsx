/**
 * @name Tint
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Apply tint
 * @label TINT
 * @shift-click Creates new adjustment layer with effect
 * @cmd-click Apply hue/saturation
 */

(function tint() {
    var layerName;
    var applyEffect;
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        layerName = "Hue/Sat";

        applyEffect = function () {
            var fx = mySolid.Effects.addProperty("ADBE HUE SATURATION");
            fx.name = "Hue/Saturation";
            fx.property(String("ADBE HUE SATURATION-0002")).setValue([1]);
            fx.property(String("ADBE HUE SATURATION-0004")).setValue([0]);
            fx.property(String("ADBE HUE SATURATION-0005")).setValue([-50]);
            fx.property(String("ADBE HUE SATURATION-0006")).setValue([0]);
            fx.property(String("ADBE HUE SATURATION-0007")).setValue([0]);
            fx.property(String("ADBE HUE SATURATION-0008")).setValue([0]);
            fx.property(String("ADBE HUE SATURATION-0009")).setValue([25]);
            fx.property(String("ADBE HUE SATURATION-0010")).setValue([0]);
        };
    } else {
        layerName = "Tint";

        applyEffect = function () {
            var fx = mySolid.Effects.addProperty("ADBE Tint");
            fx.name = "Tint";
            fx.property(String("ADBE Tint-0001")).setValue([0, 0, 0, 0]);
            fx.property(String("ADBE Tint-0002")).setValue([1, 1, 1, 0]);
            fx.property(String("ADBE Tint-0003")).setValue([100]);
        };
    }

    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    app.beginUndoGroup("Add " + layerName);
    var mySolid;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        mySolid = myComp.layers.addSolid([1, 1, 1], layerName, myComp.width, myComp.height, myComp.pixelAspect, myComp.duration);
        mySolid.startTime = 0;
        applyEffect();
        mySolid.adjustmentLayer = true;
        mySolid.label = 5;
    } else if (myComp && myComp.selectedLayers.length > 0) {
        for (var i = 0; i < myComp.selectedLayers.length; i++) {
            mySolid = myComp.selectedLayers[i];
            applyEffect();
        }
    } else {
        alert("At least one layer needs to be selected. \n\nShift-Click will result in the effect being applied to an Adjustment Layer.");
    }
    app.endUndoGroup();
})();
