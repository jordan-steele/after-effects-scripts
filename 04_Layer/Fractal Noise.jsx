/**
 * @name Fractal Noise
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description New layer w/ Fractal Noise
 * @icon-text FRCTL NOISE
 * @shift-click Precomposes the fractal noise
 */

(function fractalNoise() {
    // Pre-compose layer if Shift is held
    var precomp;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        precomp = true;
    }
    app.beginUndoGroup("New Fractal Noise");
    var comp = app.project.activeItem;
    if (comp == null) {
        alert("Please select an active comp");
        return;
    }
    var selectedLayer = comp.selectedLayers[0];
    var mySolid;
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        mySolid = comp.layers.addSolid([142 / 255, 33 / 255, 151 / 255], "Fractal Noise", comp.width, comp.height, comp.pixelAspect, comp.duration - comp.time);
        mySolid.startTime = comp.time;
        try {
            mySolid.moveBefore(selectedLayer);
        } catch (err) {}
    } else {
        mySolid = comp.layers.addSolid([142 / 255, 33 / 255, 151 / 255], "Fractal Noise", comp.width, comp.height, comp.pixelAspect, comp.duration);
        mySolid.startTime = 0;
        try {
            mySolid.moveBefore(selectedLayer);
        } catch (err) {}
    }

    var fx = mySolid.Effects.addProperty("ADBE Fractal Noise");
    fx.name = "Fractal Noise";
    fx.property(String("ADBE Fractal Noise-0001")).setValue([1]);
    fx.property(String("ADBE Fractal Noise-0002")).setValue([1]);
    fx.property(String("ADBE Fractal Noise-0003")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0004")).setValue([150]);
    fx.property(String("ADBE Fractal Noise-0005")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0006")).setValue([4]);
    fx.property(String("ADBE Fractal Noise-0008")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0009")).setValue([1]);
    fx.property(String("ADBE Fractal Noise-0010")).setValue([100]);
    fx.property(String("ADBE Fractal Noise-0011")).setValue([100]);
    fx.property(String("ADBE Fractal Noise-0012")).setValue([100]);
    fx.property(String("ADBE Fractal Noise-0013")).setValue([960, 540]);
    fx.property(String("ADBE Fractal Noise-0031")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0015")).setValue([6]);
    fx.property(String("ADBE Fractal Noise-0017")).setValue([70]);
    fx.property(String("ADBE Fractal Noise-0018")).setValue([56]);
    fx.property(String("ADBE Fractal Noise-0019")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0020")).setValue([0, 0]);
    fx.property(String("ADBE Fractal Noise-0021")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0023")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0025")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0026")).setValue([1]);
    fx.property(String("ADBE Fractal Noise-0027")).setValue([0]);
    fx.property(String("ADBE Fractal Noise-0029")).setValue([100]);
    fx.property(String("ADBE Fractal Noise-0030")).setValue([2]);
    mySolid.label = 10;
    app.endUndoGroup();

    if (precomp == true) {
        app.beginUndoGroup("Pre-Compose Layer");

        var myComp = app.project.activeItem;
        if (myComp instanceof CompItem) {
            var myLayers = myComp.selectedLayers;
            if (myLayers.length > 0) {
                var newInPoint = myLayers[0].inPoint;
                var newOutPoint = myLayers[0].outPoint;

                var newCompName = "precomp-";
                var layerName = myLayers[0].name;
                if (layerName.length > 26) {
                    layerName = layerName.substring(0, 26);
                }
                newCompName += layerName;

                var layerIndices = new Array();
                for (var i = 0; i < myLayers.length; i++) {
                    layerIndices[layerIndices.length] = myLayers[i].index;

                    if (myLayers[i].inPoint < newInPoint) {
                        newInPoint = myLayers[i].inPoint;
                    }
                    if (myLayers[i].outPoint > newOutPoint) {
                        newOutPoint = myLayers[i].outPoint;
                    }
                }
                myComp.layers.precompose(layerIndices, newCompName, true);

                var preCompLayer = myComp.selectedLayers[0];
                preCompLayer.inPoint = newInPoint;
                preCompLayer.outPoint = newOutPoint;
            } else {
                alert("select at least one layer to precompose.");
            }
        } else {
            alert("please select a composition.");
        }
        app.endUndoGroup();
    }
})();
