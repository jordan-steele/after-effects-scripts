/**
 * @name Paste
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Paste at the beginning of the selected layer
 * @label PASTE
 */

(function paste() {
    app.beginUndoGroup("Paste at Beginning");
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        app.endUndoGroup();
        return;
    }
    var selLayers = myComp.selectedLayers;
    var playhead = myComp.time;
    if (selLayers.length > 1) {
        try {
            for (var i = 0; i < selLayers.length; i++) {
                selLayers[i].selected = false;
            } //for
            for (var j = 0; j < selLayers.length; j++) {
                selLayers[j].selected = true;
                myComp.time = selLayers[j].inPoint;
                app.activeViewer.setActive();
                app.executeCommand(app.findMenuCommandId("Paste")); //Edit -> Paste
                selLayers[j].selected = false;
            } //for
            myComp.time = playhead;
        } catch (err) {
            alert(err);
        }
    } else if (selLayers.length == 1) {
        myComp.time = selLayers[0].inPoint;
        app.activeViewer.setActive();
        app.executeCommand(app.findMenuCommandId("Paste")); //Edit -> Paste
        myComp.time = playhead;
    } else {
        alert("Please select layer to paste something on to");
    }
    app.endUndoGroup();
})();
