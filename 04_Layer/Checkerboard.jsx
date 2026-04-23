/**
 * @name Checkerboard
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Creates 16x8 checkerboard layer
 * @label CHECK
 * @shift-click Creates 32x16 checkerboard layer
 * @cmd-click Creates 16-wide square checkerboard layer
 */

(function checkboard() {
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    var chX;
    var chY;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        chX = myComp.width / 32;
        chY = myComp.height / 16;
    } else if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        chX = myComp.width / 16;
        chY = chX;
    } else {
        chX = myComp.width / 16;
        chY = myComp.height / 8;
    }
    var selectedLayer = myComp.selectedLayers[0];
    app.beginUndoGroup("Create Checkerboard");

    var chkBG = myComp.layers.addSolid([0, 0, 0], "BG", myComp.width, myComp.height, 1);
    var fx = chkBG.Effects.addProperty("ADBE Fill");
    fx.name = "Fill";
    fx.property(String("ADBE Fill-0002")).setValue([0, 0, 0, 1]);

    var chk = myComp.layers.addSolid([0, 0, 0], "Checkers", myComp.width, myComp.height, 1);
    fx = chk.Effects.addProperty("ADBE Checkerboard");
    fx.name = "Checkerboard";
    fx.property(String("ADBE Checkerboard-0001")).setValue([-0.5, -0.5]);
    fx.property(String("ADBE Checkerboard-0002")).setValue(3);
    fx.property(String("ADBE Checkerboard-0004")).setValue(chX);
    fx.property(String("ADBE Checkerboard-0005")).setValue(chY);

    var layerIndices = [chk.index, chkBG.index];
    var newCompName = "Checkerboard";

    myComp.layers.precompose(layerIndices, newCompName, true);

    var chkLayer = myComp.selectedLayers[0];

    try {
        chkLayer.moveBefore(selectedLayer);
    } catch (err) {}

    app.endUndoGroup();
})();
