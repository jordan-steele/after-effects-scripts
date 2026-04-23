/**
 * @name Transform Null for Mocha
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Creates null and sets it as the transform null for the selected layers Mocha AE or Mocha Pro effect
 * @label TR NULL
 */

(function addNull() {
    app.beginUndoGroup("Transform Null from Mocha Track");
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        app.endUndoGroup();
        return;
    }
    var selectedLayers = myComp.selectedLayers;
    if (selectedLayers.length == 0) {
        alert("Please select a layer with a Mocha AE effect.");
        app.endUndoGroup();
        return;
    }

    var mochaAE = selectedLayers[0].Effects.property("mochaAECC");
    var mochaPro = selectedLayers[0].Effects.property("mochaProAE");
    if (mochaAE == null && mochaPro == null) {
        alert("No Mocha AE or Mocha Pro effect found on the selected layer.");
        app.endUndoGroup();
        return;
    }

    var currentIndex = selectedLayers[0].index;

    var mySolid = myComp.layers.addNull();
    try {
        mySolid.moveBefore(selectedLayers[0]);
    } catch (err) {}
    mySolid.name = "Track Data";
    mySolid.startTime = selectedLayers[0].inPoint;
    mySolid.outPoint = selectedLayers[0].outPoint;

    if (mochaAE != null) {
        mochaAE.property("mochaAECC-2354").setValue(3);
        mochaAE.property("mochaAECC-2355").setValue(mySolid.index);
    } else {
        mochaPro.property("mochaProAE-2354").setValue(3);
        mochaPro.property("mochaProAE-2355").setValue(mySolid.index);
    }
    mySolid.selected = false;
    myComp.layer(currentIndex + 1).selected = true;
    app.endUndoGroup();
})();
