/**
 * @name Trim Layers to Comp
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Trim all layers in selected comp(s) if they extend beyond the beginning or end of the comp
 * @label TRIM
 */
(function trimToComp() {
    function trimThisComp(comp) {
        // Get the start and end times of the composition
        var compStart = 0;
        var compEnd = comp.duration;
        // alert(compStart + "\n" + compEnd);

        // Loop through all selected layers
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            // alert(layer.inPoint + "\n" + layer.outPoint);

            // Trim in point if it's before the start of the comp
            if (layer.inPoint < compStart) {
                layer.inPoint = compStart;
            }

            // Trim out point if it's after the end of the comp
            if (layer.outPoint > compEnd) {
                layer.outPoint = compEnd;
            }
        }
    }

    app.beginUndoGroup("Trim Layers to Comp Duration");

    var sel_vids = app.project.selection;
    var myComp = app.project.activeItem;
    if (myComp == null && sel_vids == null) {
        alert("Please select an active comp or multiple comps in the project panel");
        return;
    }
    if (myComp != null && myComp instanceof CompItem) {
        trimThisComp(myComp);
    } else if (sel_vids != null) {
        for (var e = 0; e < sel_vids.length; e++) {
            var myComp2 = sel_vids[e];
            trimThisComp(myComp2);
        }
    }
    app.endUndoGroup();
})();
