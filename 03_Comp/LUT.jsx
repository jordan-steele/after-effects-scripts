/**
 * @name Add LUT
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description New Adjustment Layer w/ LUT
 * @label LUT
 */

(function lut() {
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    app.beginUndoGroup("Add LUT Layer");
    var mySolid = myComp.layers.addSolid([0.2, 0.2, 0.2], "LUT", myComp.width, myComp.height, myComp.pixelAspect);
    var fx = mySolid.Effects.addProperty("ADBE Lumetri");
    fx.property(String("ADBE Lumetri-0005")).setValue(7);
    mySolid.adjustmentLayer = true;
    mySolid.guideLayer = true;
    mySolid.label = 0;
    app.endUndoGroup();
})();
