/**
 * @name Set Matte
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Effect
 * @description Set matte effect to layer above selected layer
 * @label MATTE
 * @shift-click Set matte all selected layers to layer above first selected layer
 */

(function setMatte() {
    app.beginUndoGroup("Set Matte");

    var thisFileName = new File($.fileName).displayName.replace(/(.*)\.(.*?)$/, "$1");
    var preset = new File(new File($.fileName).parent.absoluteURI + "/" + thisFileName + ".ffx");

    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        app.endUndoGroup();
        return;
    }
    var selectedLayers = myComp.selectedLayers;
    if (selectedLayers.length == 0) {
        alert("At least one layer needs to be selected.");
        app.endUndoGroup();
        return;
    }
    var shiftHeld;
    var shiftMatteIndex;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
        shiftMatteIndex = selectedLayers[0].index - 1;
    }
    var indexArray = [];
    var j, k;
    for (var i = 0; i < selectedLayers.length; i++) {
        indexArray.push(selectedLayers[i].index);
    }
    for (j = 0; j < indexArray.length; j++) {
        for (k = 1; k <= myComp.numLayers; k++) {
            if (myComp.layer(k).index == indexArray[j]) {
                myComp.layer(k).selected = true;
            } //if
            else {
                myComp.layer(k).selected = false;
            } //else
        } //for
        var mySolid = myComp.selectedLayers[0];
        mySolid.applyPreset(preset);
        var fx = mySolid.Effects.property(mySolid.Effects.numProperties);
        if (shiftHeld == true) {
            fx.property(1).setValue(shiftMatteIndex);
        } //if
        else {
            fx.property(1).setValue(mySolid.index - 1);
        }
    }

    for (k = 1; k <= myComp.numLayers; k++) {
        myComp.layer(k).selected = false;
        for (j = 0; j < indexArray.length; j++) {
            if (myComp.layer(k).index == indexArray[j]) {
                myComp.layer(k).selected = true;
            } //if
        } //for
    } //for
    app.endUndoGroup();
})();
