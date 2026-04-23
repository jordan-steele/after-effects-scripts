/**
 * @name Black Solid
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description New Black Solid
 * @label SOLID
 * @shift-click 50% grey layer
 */

(function blackSolid() {
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    var selectedLayer = myComp.selectedLayers[0];
    app.beginUndoGroup("Add Black Solid");
    var mySolid;
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        mySolid = myComp.layers.addSolid([0, 0, 0], "Black Solid", myComp.width, myComp.height, 1, myComp.duration - myComp.time);
        mySolid.startTime = myComp.time;
    } else if (ScriptUI.environment.keyboardState.shiftKey) {
        mySolid = myComp.layers.addSolid([0.5, 0.5, 0.5], "Grey Solid", myComp.width, myComp.height, 1);
        mySolid.startTime = 0;
    } else {
        mySolid = myComp.layers.addSolid([0, 0, 0], "Black Solid", myComp.width, myComp.height, 1);
        mySolid.startTime = 0;
    }
    mySolid.label = 1;
    try {
        mySolid.moveBefore(selectedLayer);
    } catch (err) {}
    app.endUndoGroup();
})();
