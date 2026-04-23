/**
 * @name Add grain
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Adds Grain adjustment layer
 * @label GRAIN
 * @shift-click Apply Match Grain adjustment layer
 * @cmd-click Higher grain intensity adjustment layer
 */

(function grain() {
    var shiftHeld;
    var cmdHeld;
    var layerName;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
        layerName = "Grain";
    } else if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        cmdHeld = true;
        layerName = "Match Grain";
    } else {
        layerName = "Grain";
    }

    //Define effect here (can be copied from ft-toolbar "Get Effect with Parameters")
    function applyEffect() {
        var fx;
        if (shiftHeld == true) {
            fx = mySolid.Effects.addProperty("VISINF Grain Implant");
            fx.name = "Add Grain";
            fx.property(String("VISINF Grain Implant-0021")).setValue(3);
            fx.property(String("VISINF Grain Implant-0008")).setValue(0.5);
            fx.property(String("VISINF Grain Implant-0007")).setValue(0.4);
            fx.property(String("VISINF Grain Implant-0130")).setValue(1.2);
            fx.property(String("VISINF Grain Implant-0002")).setValue(1.2);
            fx.property(String("VISINF Grain Implant-0003")).setValue(0.7);
            fx.property(String("VISINF Grain Implant-0004")).setValue(1.7);
            fx.property(String("VISINF Grain Implant-0032")).setValue(1.4);
            fx.property(String("VISINF Grain Implant-0033")).setValue(1.2);
            fx.property(String("VISINF Grain Implant-0034")).setValue(2);
            fx.property(String("VISINF Grain Implant-0040")).setValue(2);
            fx.property(String("VISINF Grain Implant-0041")).setValue(0.4);
            fx.property(String("VISINF Grain Implant-0042")).setValue(0.7);
        } else if (cmdHeld == true) {
            fx = mySolid.Effects.addProperty("VISINF Grain Duplication");
            fx.name = "Match Grain";
            fx.property(String("VISINF Grain Duplication-0002")).setValue(5);
            try {
                fx.property(String("VISINF Grain Duplication-0013")).setValue(selectedLayer.index);
            } catch (err) {}
        } else {
            fx = mySolid.Effects.addProperty("VISINF Grain Implant");
            /*
			fx.property(String('VISINF Grain Implant-0021')).setValue(3);
			fx.property(String('VISINF Grain Implant-0008')).setValue(0.1);
			fx.property(String('VISINF Grain Implant-0007')).setValue(0.3);
			fx.property(String('VISINF Grain Implant-0130')).setValue(1.2);
			fx.property(String('VISINF Grain Implant-0002')).setValue(0.7);
			fx.property(String('VISINF Grain Implant-0003')).setValue(0.7);
			fx.property(String('VISINF Grain Implant-0004')).setValue(1.4);
			fx.property(String('VISINF Grain Implant-0033')).setValue(0.9);
			*/
            fx.property(String("VISINF Grain Implant-0021")).setValue(3);
            fx.property(String("VISINF Grain Implant-0008")).setValue(0.2);
            fx.property(String("VISINF Grain Implant-0007")).setValue(0.4);
            fx.property(String("VISINF Grain Implant-0130")).setValue(1.2);
            fx.property(String("VISINF Grain Implant-0002")).setValue(1.2);
            fx.property(String("VISINF Grain Implant-0003")).setValue(0.7);
            fx.property(String("VISINF Grain Implant-0004")).setValue(1.7);
            fx.property(String("VISINF Grain Implant-0032")).setValue(1.4);
            fx.property(String("VISINF Grain Implant-0033")).setValue(1.2);
            fx.property(String("VISINF Grain Implant-0034")).setValue(2);
            fx.property(String("VISINF Grain Implant-0040")).setValue(2);
            fx.property(String("VISINF Grain Implant-0041")).setValue(0.4);
            fx.property(String("VISINF Grain Implant-0042")).setValue(0.7);
        }
    }

    //Begin running script
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    var selectedLayer = myComp.selectedLayers[0];
    app.beginUndoGroup("Add Grain");
    var mySolid = myComp.layers.addSolid([0.2, 0.2, 0.2], layerName, myComp.width, myComp.height, myComp.pixelAspect);
    mySolid.startTime = 0;
    applyEffect();
    mySolid.adjustmentLayer = true;
    mySolid.label = 0;
    if (selectedLayer) {
        mySolid.moveBefore(selectedLayer);
        mySolid.startTime = selectedLayer.startTime;
        mySolid.inPoint = selectedLayer.inPoint;
        mySolid.outPoint = selectedLayer.outPoint;
        mySolid.setTrackMatte(selectedLayer, TrackMatteType.ALPHA);
        selectedLayer.enabled = true;
    }
    app.endUndoGroup();
})();
