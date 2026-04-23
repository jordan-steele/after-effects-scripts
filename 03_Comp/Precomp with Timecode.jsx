/**
 * @name Precomp
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Precomp selected layers, retaining the timecode of the original comp
 * @label PRECOMP
 * @shift-click Precomp single layer with collapse transformations
 * @changelog Bug Fix: Fix for inPoints and better timecode set methods
 */

(function precompTimecode() {
    var shiftHeld = ScriptUI.environment.keyboardState.shiftKey ? true : false;

    var curComp = app.project.activeItem;
    if (curComp == null) {
        alert("Please select an active comp");
        return;
    }
    var layers = curComp.selectedLayers;
    if (layers.length == 1 && shiftHeld == true) {
        app.beginUndoGroup("Precomp Layer");
        curComp.layers.precompose([layers[0].index], layers[0].name + " - Collapse", false);
        curComp.selectedLayers[0].collapseTransformation = true;
        app.endUndoGroup();
    } else if (layers.length != 1 && shiftHeld == true) {
        alert("Please select only one layer");
    } else {
        var preCompIndices = new Array();
        app.beginUndoGroup("Precomp Selected Layers");
        var name = curComp.name.split("_");
        var nameEnd = name.pop();
        var usrPrompt = Window.prompt("Precomp Name:\n" + name.join("_") + "_ + input + _" + nameEnd, "");
        var formattedName = name.join("_") + "_" + usrPrompt + "_" + nameEnd;
        if (usrPrompt != null) {
            // Find the earliest inPoint and latest outPoint across all selected layers
            var groupIn = layers[0].inPoint;
            var groupOut = layers[0].outPoint;

            var i;
            for (i = 0; i < layers.length; i++) {
                if (layers[i].inPoint < groupIn) {
                    groupIn = layers[i].inPoint;
                }
                if (layers[i].outPoint > groupOut) {
                    groupOut = layers[i].outPoint;
                }
            }

            var groupDuration = groupOut - groupIn;

            for (i = 0; i < layers.length; i++) {
                preCompIndices[i] = layers[i].index;
            } //for

            var preCompItem = curComp.layers.precompose(preCompIndices, formattedName, true);
            preCompItem.duration = groupDuration;
            preCompItem.displayStartFrame = groupIn / curComp.frameDuration + curComp.displayStartFrame;
            preCompItem.parentFolder = curComp.parentFolder;
            preCompItem.workAreaStart = 0;
            preCompItem.workAreaDuration = preCompItem.duration;

            var preComp = curComp.selectedLayers[0];
            preComp.startTime = groupIn;
            preComp.inPoint = groupIn;
            preComp.outPoint = groupOut;

            for (var j = 1; j <= preCompItem.layers.length; j++) {
                var layer = preCompItem.layer(j);
                var preStart = layer.startTime;

                layer.startTime = preStart - groupIn;
            }

            app.endUndoGroup();
        } //if
    }
})();
