/**
 * @name Auto Slate
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Copies layers from a "slate" comp in project to current comp(s)
 * @label SLATE
 * @shift-click Adds 1 frame at the beginning for the slate
 */

(function addSlate() {
    app.beginUndoGroup("Add Slate");
    var i, j, k, e, myComp2;
    var currentLayer;
    var slateCheck;
    var slateComp;
    var layerCopy;
    var lastLayer;
    var sel_vids = app.project.selection;
    var myComp = app.project.activeItem;
    if (myComp == null && sel_vids == null) {
        alert("Please select an active comp or multiple comps in the project panel");
        app.endUndoGroup();
        return;
    }
    var slateStatus = false;
    var shiftHeld = false;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
    }
    if (myComp != null && myComp instanceof CompItem) {
        if (shiftHeld == true) {
            myComp.duration += 1 * myComp.frameDuration;
            myComp.workAreaStart = 0;
            myComp.workAreaDuration = myComp.duration;
            myComp.displayStartTime -= myComp.frameDuration;
            for (i = 1; i <= myComp.numLayers; ++i) {
                currentLayer = myComp.layer(i);
                currentLayer.startTime += 1 * myComp.frameDuration;
            }
        }
        for (j = 1; j <= myComp.numLayers; j++) {
            myComp.layer(j).selected = false;
        }
        for (i = 1; i <= app.project.numItems; i++) {
            slateCheck = app.project.item(i).name;
            if (slateCheck == "slate") {
                slateStatus = true;
                slateComp = app.project.item(i);
                for (k = 1; k <= slateComp.numLayers; k++) {
                    layerCopy = slateComp.layer(k);
                    layerCopy.copyToComp(myComp);
                    if (k != 1) {
                        lastLayer = myComp.layer(k);
                        myComp.layer(1).moveAfter(lastLayer);
                    }
                }
            }
        }
    } else if (sel_vids != null) {
        for (e = 0; e < sel_vids.length; e++) {
            myComp2 = sel_vids[e];
            if (!(myComp2 instanceof CompItem)) {
                continue;
            }
            if (shiftHeld == true) {
                myComp2.duration += 1 * myComp2.frameDuration;
                myComp2.workAreaStart = 0;
                myComp2.workAreaDuration = myComp2.duration;
                myComp2.displayStartTime -= myComp2.frameDuration;
                for (i = 1; i <= myComp2.numLayers; ++i) {
                    currentLayer = myComp2.layer(i);
                    currentLayer.startTime += 1 * myComp2.frameDuration;
                }
            }

            for (j = 1; j <= myComp2.numLayers; j++) {
                myComp2.layer(j).selected = false;
            }
            for (i = 1; i <= app.project.numItems; i++) {
                slateCheck = app.project.item(i).name;
                if (slateCheck == "slate") {
                    slateStatus = true;
                    slateComp = app.project.item(i);
                    for (k = 1; k <= slateComp.numLayers; k++) {
                        layerCopy = slateComp.layer(k);
                        layerCopy.copyToComp(myComp2);
                        if (k != 1) {
                            lastLayer = myComp2.layer(k);
                            myComp2.layer(1).moveAfter(lastLayer);
                        }
                    }
                }
            }
        }
    }

    if (slateStatus == false) {
        alert('No comp named "slate" has been found in your project.');
    }
    app.endUndoGroup();
})();
