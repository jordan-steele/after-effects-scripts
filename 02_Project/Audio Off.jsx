/**
 * @name Audio Off
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Mutes all layers with audio in all comps in the project
 * @label OFF
 */

(function audioOff() {
    app.beginUndoGroup("Turn Off Audio on Layers");

    for (var j = 0; j < app.project.numItems; ++j) {
        try {
            var myComp = app.project.items[j];
            for (var i = 1; i <= myComp.numLayers; ++i) {
                var currentLayer = myComp.layer(i);
                currentLayer.audioEnabled = false;
            }
        } catch (err) {
            // alert(err);
        }
    }

    app.endUndoGroup();
})();
