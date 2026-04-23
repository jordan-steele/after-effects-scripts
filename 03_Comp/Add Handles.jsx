/**
 * @name Add Handles
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Add frames to beginning or end of a comp. Selected layers will extend to fill the new time.
 * @label HANDLES
 * @changelog Bug Fix: Fixed icon color
 */

(function js_addHandles() {
    // Create and show the main window
    var mainWindow = new Window("dialog", "Add Handles");
    mainWindow.orientation = "column";
    mainWindow.alignChildren = ["center", "top"];
    mainWindow.spacing = 10;
    mainWindow.margins = 16;

    // Create input fields
    var startFramesGroup = mainWindow.add("group");
    startFramesGroup.add("statictext", undefined, "Frames to add at start:");
    var startFramesInput = startFramesGroup.add("edittext", undefined, "0");
    startFramesInput.characters = 5;

    var endFramesGroup = mainWindow.add("group");
    endFramesGroup.add("statictext", undefined, "Frames to add at end:");
    var endFramesInput = endFramesGroup.add("edittext", undefined, "0");
    endFramesInput.characters = 5;

    // Create buttons
    var buttonGroup = mainWindow.add("group");
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");

    // Set default button
    okButton.onClick = function () {
        var startFrames = parseInt(startFramesInput.text, 10);
        var endFrames = parseInt(endFramesInput.text, 10);

        if (isNaN(startFrames) || isNaN(endFrames)) {
            alert("Please enter valid numbers for both start and end frames.");
            return;
        }

        extendComposition(startFrames, endFrames);
        mainWindow.close();
    };

    cancelButton.onClick = function () {
        mainWindow.close();
    };

    function extendComposition(startFrames, endFrames) {
        app.beginUndoGroup("Extend Composition");

        try {
            var activeComp = app.project.activeItem;

            if (!activeComp || !(activeComp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }

            var frameDuration = activeComp.frameDuration;
            var workAreaStart = activeComp.workAreaStart;
            var workAreaDuration = activeComp.workAreaDuration;
            var workAreaAtEnd = timeToCurrentFormat(workAreaStart + workAreaDuration, activeComp.frameRate) == timeToCurrentFormat(activeComp.duration, activeComp.frameRate);

            activeComp.duration += (startFrames + endFrames) * frameDuration;

            if (startFrames > 0) {
                try {
                    activeComp.displayStartFrame -= startFrames;
                } catch (e) {
                    // Ignore error if displayStartFrame can't be adjusted
                }

                if (workAreaStart != 0) {
                    activeComp.workAreaStart = workAreaStart + startFrames * frameDuration;
                    activeComp.workAreaDuration = workAreaDuration;
                }
            }

            if (endFrames > 0 && workAreaAtEnd) {
                var startAdjust = workAreaStart == 0 ? startFrames * frameDuration : 0;
                activeComp.workAreaDuration = workAreaDuration + endFrames * frameDuration + startAdjust;
            }

            // Adjust layers
            for (var i = 1; i <= activeComp.numLayers; i++) {
                var currentLayer = activeComp.layer(i);
                if (startFrames > 0) {
                    if (!currentLayer.locked) {
                        currentLayer.startTime += startFrames * frameDuration;
                    } else if (currentLayer.locked) {
                        currentLayer.locked = false;
                        currentLayer.startTime += startFrames * frameDuration;
                        currentLayer.locked = true;
                    }
                    if (currentLayer.selected) {
                        var outPoint = currentLayer.outPoint;
                        currentLayer.inPoint -= startFrames * activeComp.frameDuration;
                        currentLayer.outPoint = outPoint;
                    }
                }
                if (endFrames > 0) {
                    if (currentLayer.locked && timeToCurrentFormat(currentLayer.outPoint + endFrames * frameDuration, activeComp.frameRate) == timeToCurrentFormat(activeComp.duration, activeComp.frameRate)) {
                        currentLayer.locked = false;
                        currentLayer.outPoint += endFrames * frameDuration;
                        currentLayer.locked = true;
                    } else if (!currentLayer.locked && currentLayer.selected) {
                        currentLayer.outPoint += endFrames * frameDuration;
                    }
                }
            }

            // Adjust markers
            if (activeComp.markerProperty.numKeys != 0) {
                var markerTimeArray = [];
                var markerCommentArray = [];
                for (var j = 1; j <= activeComp.markerProperty.numKeys; j++) {
                    markerTimeArray.push(activeComp.markerProperty.keyTime(j));
                    markerCommentArray.push(activeComp.markerProperty.keyValue(j).comment);
                }
                while (activeComp.markerProperty.numKeys != 0) {
                    activeComp.markerProperty.removeKey(1);
                }
                for (var k = 0; k < markerTimeArray.length; k++) {
                    var newMarker = new MarkerValue(markerCommentArray[k]);
                    activeComp.markerProperty.setValueAtTime(markerTimeArray[k] + startFrames * frameDuration, newMarker);
                }
            }

            alert("Composition extended successfully!");
        } catch (error) {
            alert("An error occurred: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    mainWindow.show();
})();
