/**
 * @name Gradient Ramp
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Create new solid ramp for a DoF map
 * @label RAMP
 * @shift-click Center gradient
 * @cmd-click Precomp the gradient
 */

(function ramp() {
    var shiftHeld;
    var cmdHeld;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
    }
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        cmdHeld = true;
    }

    var myComp = app.project.activeItem;
    if (!myComp || !(myComp instanceof CompItem)) {
        return alert("Please select composition first.");
    }

    app.beginUndoGroup("Add DoF Ramp");

    var mySolid = myComp.layers.addSolid([1, 1, 1], "DoF Map", myComp.width, myComp.height, 1);

    if (shiftHeld == true) {
        var myMask = mySolid.Masks.addProperty("Mask");
        var myMaskShape = myMask.property("maskShape");
        var myShape = myMaskShape.value;
        myShape.vertices = [
            [1012, -1168],
            [116, 2457.99975585938],
            [958, 2457.99975585938],
            [1894, -1176]
        ];
        myShape.inTangents = [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0]
        ];
        myShape.outTangents = [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0]
        ];
        myShape.closed = true;
        myMask.property("maskFeather").setValue([600, 600]);
        myMask.property("maskExpansion").setValue(-150);
        myMaskShape.setValue(myShape);
    } else {
        var fx = mySolid.Effects.addProperty("ADBE Ramp");
        fx.name = "Gradient Ramp";
        fx.property(String("ADBE Ramp-0001")).setValue([0, 0]);
        fx.property(String("ADBE Ramp-0003")).setValue([myComp.width, 0]);
    }

    if (cmdHeld == true) {
        var newInPoint = mySolid.inPoint;

        var newCompName = "DoF Map Precomp";

        var layerIndices = new Array();
        layerIndices[layerIndices.length] = mySolid.index;

        var newComp = myComp.layers.precompose(layerIndices, newCompName, true);
        newComp.preserveNestedFrameRate = true;
        try {
            for (var j = 1; 1 <= app.project.numItems; j++) {
                if (app.project.item(j).name.search("precomps") != -1 && app.project.item(j) instanceof FolderItem) {
                    newComp.parentFolder = app.project.item(j);
                    break;
                }
            }
        } catch (err) {}

        var preCompLayer = myComp.selectedLayers[0];
        preCompLayer.inPoint = newInPoint;
    }

    app.endUndoGroup();
})();
