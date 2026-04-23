/**
 * @name Key Before & After
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Keyframe
 * @description Adds keyframes before & after the current playhead
 * @label KEY
 * @shift-click Only add keyframe before
 * @cmd-click Only add keyframe after
 */

(function keyBeforeAndAfter() {
    var shiftHeld = false;
    var cmdHeld = false;

    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        cmdHeld = true;
    }
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
    }

    app.beginUndoGroup("Set Keyframes");
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    var selProps = myComp.selectedProperties;
    if (selProps[0] == null) {
        alert("Please select 1 or more properties");
    } else {
        for (var i = 0; i < selProps.length; i++) {
            if (shiftHeld == true) {
                try {
                    selProps[i].addKey(myComp.time - myComp.frameDuration);
                } catch (err) {}
            } //if
            else if (cmdHeld == true) {
                try {
                    selProps[i].addKey(myComp.time + myComp.frameDuration);
                } catch (err) {}
            } //else if
            else {
                try {
                    selProps[i].addKey(myComp.time - myComp.frameDuration);
                } catch (err) {}
                try {
                    selProps[i].addKey(myComp.time + myComp.frameDuration);
                } catch (err) {}
            }
        }
    }
})();
