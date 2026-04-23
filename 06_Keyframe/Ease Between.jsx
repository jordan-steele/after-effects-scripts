/**
 * @name Ease Between
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Keyframe
 * @description Eases out the first keyframe and eases in the second keyframe
 * @label EASE
 */

(function easeBetween() {
    var comp = app.project.activeItem;
    if (comp == null) {
        alert("Please select an active comp");
        return;
    }
    app.beginUndoGroup("Ease Between Keyframes");
    if (comp.selectedProperties.length == 0) {
        alert("Please select some properties with keyframes");
        app.endUndoGroup();
        return;
    }
    for (var i = 0; i < comp.selectedProperties.length; i++) {
        var property = comp.selectedProperties[i];
        try {
            property.setInterpolationTypeAtKey(property.selectedKeys[0], KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.BEZIER);
            property.setInterpolationTypeAtKey(property.selectedKeys[1], KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.LINEAR);
        } catch (err) {}
    }

    app.endUndoGroup();
})();
