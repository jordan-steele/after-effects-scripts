/**
 * @name White Solid
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description New White Solid
 * @label SOLID
 * @shift-click Sets to blending mode to Classic Color Dodge
 */

(function whiteSolid() {
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    var selectedLayer = myComp.selectedLayers[0];
    app.beginUndoGroup("Add White Solid");
    var mySolid;
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        mySolid = myComp.layers.addSolid([1, 1, 1], "White Solid", myComp.width, myComp.height, 1, myComp.duration - myComp.time);
        mySolid.startTime = myComp.time;
    } else {
        mySolid = myComp.layers.addSolid([1, 1, 1], "White Solid", myComp.width, myComp.height, 1);
        mySolid.startTime = 0;
    }
    if (ScriptUI.environment.keyboardState.shiftKey) {
        mySolid.blendingMode = BlendingMode.CLASSIC_COLOR_DODGE;
        mySolid.opacity.setValue(60);
    }
    mySolid.label = 1;
    try {
        mySolid.moveBefore(selectedLayer);
    } catch (err) {}
    app.endUndoGroup();
})();
