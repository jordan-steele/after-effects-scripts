/**
 * @name Assemble Comps
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Assembles selected items in a new comp minus handles
 * @label ASSEMBLE
 */

(function assembly() {
    var myProj = app.project;
    var selectedVids = myProj.selection;
    if (selectedVids.length < 2) {
        alert("Please select multiple clips in the project panel");
        return;
    }
    var usrPrompt = Window.prompt("Amount of handles to trim before assembly", 12);
    var handles = parseInt(usrPrompt, 10);
    var fps = selectedVids[0].frameRate;
    if (usrPrompt != null) {
        app.beginUndoGroup("Create String-Out Assembly");
        var compDuration = 0;
        for (var i = 0; i < selectedVids.length; i++) {
            compDuration += selectedVids[i].duration - currentFormatToTime(handles, fps) * 2;
        }
        var name = selectedVids[0].name;
        var newComp = app.project.items.addComp(name.substring(0, 11) + "-ASSEMBLY", selectedVids[0].width, selectedVids[0].height, selectedVids[0].pixelAspect, compDuration, selectedVids[0].frameRate);
        newComp.openInViewer();
        var curOut = 0;
        for (var j = 0; j < selectedVids.length; j++) {
            var newLayer = newComp.layers.add(selectedVids[j]);
            var curStart = newLayer.startTime;
            newLayer.inPoint = handles * newComp.frameDuration;
            if (j == 0) {
                newLayer.startTime = curStart - handles * newComp.frameDuration;
            } else {
                newLayer.startTime = curOut - handles * newComp.frameDuration;
            }
            newLayer.outPoint = newLayer.outPoint - handles * newComp.frameDuration;
            curOut = newLayer.outPoint;
        }

        app.endUndoGroup();
    }
})();
