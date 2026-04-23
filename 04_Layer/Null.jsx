/**
 * @name Add Null
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Add Null
 * @label NULL
 * @shift-click Applies Copied Data to the Null
 * @cmd-click Starts null at playhead
 */

(function addNull() {
    app.beginUndoGroup("Add Null");
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        app.endUndoGroup();
        return;
    }
    var selectedLayers = myComp.selectedLayers;
    var mySolid = myComp.layers.addNull();
    try {
        mySolid.moveBefore(selectedLayers[0]);
    } catch (err) {}

    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        mySolid.startTime = myComp.time;
    }

    if (ScriptUI.environment.keyboardState.shiftKey) {
        mySolid.name = "Track Data";
        var playhead = myComp.time;
        mySolid.startTime = 0;
        myComp.time = 0;
        app.executeCommand(app.findMenuCommandId("Paste"));
        if (selectedLayers[0] != null) {
            myComp.time = playhead;
            mySolid.startTime = selectedLayers[0].inPoint;
        }
    }
    app.endUndoGroup();
})();
