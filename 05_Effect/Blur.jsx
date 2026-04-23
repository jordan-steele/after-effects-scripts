/**
 * @name Blur
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Apply gaussian blur
 * @label BLUR
 * @shift-click Apply camera lens blur
 * @cmd-click Creates a depth map for camera lens blur
 */

(function blur() {
    var shiftheld;
    var cmdheld;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftheld = true;
    } else {
        shiftheld = false;
    }
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        cmdheld = true;
    } else {
        cmdheld = false;
    }

    app.beginUndoGroup("Add Blur");
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        app.endUndoGroup();
        return;
    }
    var selLayers = myComp.selectedLayers;
    if (selLayers.length != 0) {
        var layer;
        var fx;
        for (var i = 0; i < myComp.selectedLayers.length; i++) {
            if (shiftheld == true || cmdheld == true) {
                layer = selLayers[i];
                fx = layer.Effects.addProperty("ADBE Camera Lens Blur");
                try {
                    fx.property(String("ADBE Camera Lens Blur-0001")).setValue([10]);
                } catch (e) {}

                if (cmdheld == true) {
                    var whiteSolid = myComp.layers.addSolid([1, 1, 1], "White Solid", myComp.width, myComp.height, 1);
                    whiteSolid.startTime = 0;
                    whiteSolid.label = 1;

                    var vWidth = myComp.width;
                    var vHeight = myComp.height;
                    var vPixel = myComp.pixelAspect;
                    var vDuration = myComp.duration;

                    var vColor = [0 / 255, 0 / 255, 0 / 255];
                    var vName = "Vignette";

                    var vCurve = 400;
                    var vInset = 200;
                    var vExpansion = -250;

                    var myVignette = myComp.layers.addSolid(vColor, vName, vWidth, vHeight, vPixel, vDuration); // make new solid

                    var myMask = myVignette.Masks.addProperty("Mask");
                    var myMaskShape = myMask.property("maskShape");
                    var myShape = myMaskShape.value;
                    myShape.vertices = [
                        [vInset, vInset],
                        [vWidth - vInset, vInset],
                        [vWidth - vInset, vHeight - vInset],
                        [vInset, vHeight - vInset]
                    ];
                    myShape.inTangents = [
                        [-vCurve, vCurve],
                        [-vCurve, -vCurve],
                        [vCurve, -vCurve],
                        [vCurve, vCurve]
                    ];
                    myShape.outTangents = [
                        [vCurve, -vCurve],
                        [vCurve, vCurve],
                        [-vCurve, vCurve],
                        [-vCurve, -vCurve]
                    ];
                    myShape.closed = true;
                    myMask.property("maskFeather").setValue([vCurve, vCurve]);
                    myMask.property("maskExpansion").setValue(vExpansion);
                    myMaskShape.setValue(myShape);
                    myMask.rotoBezier = true;

                    myVignette.opacity.setValue(100);
                    myVignette.blendingMode = BlendingMode.MULTIPLY;

                    myVignette.selected = true;
                    whiteSolid.selected = true;

                    myComp = app.project.activeItem;
                    if (myComp instanceof CompItem) {
                        var myLayers = myComp.selectedLayers;
                        if (myLayers.length > 0) {
                            var newInPoint = myLayers[0].inPoint;
                            var newOutPoint = myLayers[0].outPoint;

                            var newCompName = "FL_DoF_MAP";

                            var layerIndices = new Array();
                            for (var l = 0; l < myLayers.length; l++) {
                                layerIndices[layerIndices.length] = myLayers[l].index;
                                if (myLayers[l].inPoint < newInPoint) {
                                    newInPoint = myLayers[l].inPoint;
                                }
                                if (myLayers[l].outPoint > newOutPoint) {
                                    newOutPoint = myLayers[l].outPoint;
                                }
                            }
                            myComp.layers.precompose(layerIndices, newCompName, true);
                            var preCompLayer = myComp.selectedLayers[0];
                            preCompLayer.inPoint = newInPoint;
                            preCompLayer.outPoint = newOutPoint;
                            preCompLayer.enabled = false;
                        }
                    }

                    try {
                        fx.property(String("ADBE Camera Lens Blur-0010")).setValue(1);
                    } catch (e) {
                        alert(e);
                    }
                }
            } else {
                layer = selLayers[i];
                fx = layer.Effects.addProperty("ADBE Gaussian Blur 2");
                fx.name = "Gaussian Blur";
                try {
                    fx.property(String("ADBE Gaussian Blur 2-0001")).setValue(3);
                } catch (e) {}
                try {
                    fx.property(String("ADBE Gaussian Blur 2-0002")).setValue(1);
                } catch (e) {}
                try {
                    fx.property(String("ADBE Gaussian Blur 2-0003")).setValue(1);
                } catch (e) {}
            }
        }
    } else {
        alert("You need at least one selected layer");
    }
    app.endUndoGroup();
})();
