/**
 * @name Viewer Resolution
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Changes Viewer Resolution in all comps to Full
 * @label VIEWER
 * @shift-click Half resolution
 * @cmd-click Quarter resolution
 */

(function viewerRes() {
    var shiftHeld;
    var cmdHeld;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
    }
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        cmdHeld = true;
    }
    app.beginUndoGroup("Change Resolution for All Comps");
    var myComp;
    var i;
    if (shiftHeld == true) {
        for (i = 1; i <= app.project.numItems; i++) {
            myComp = app.project.item(i);
            try {
                myComp.resolutionFactor = [2, 2];
            } catch (err) {}
        }
    } else if (cmdHeld == true) {
        for (i = 1; i <= app.project.numItems; i++) {
            myComp = app.project.item(i);
            try {
                myComp.resolutionFactor = [4, 4];
            } catch (err) {}
        }
    } else {
        for (i = 1; i <= app.project.numItems; i++) {
            myComp = app.project.item(i);
            try {
                myComp.resolutionFactor = [1, 1];
            } catch (err) {}
        }
    }
    app.endUndoGroup();
})();
