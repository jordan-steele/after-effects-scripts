/**
 * @name Stagger Layers
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Stagger layers by a certain number of frames
 * @label STAGGER
 * @changelog Update: Added option for randomized stagger
 */

(function staggerLayers() {
    var scriptWindow = new Window("dialog", "Stagger Layers");

    var staticText = scriptWindow.add("statictext", undefined, "# Frames between each layer");

    var frameInput = scriptWindow.add("edittext", undefined, "4");
    frameInput.alignment = ["fill", "top"];
    frameInput.active = true;

    var randomCheckbox = scriptWindow.add("checkbox", undefined, "Random Stagger (0 to max frames)");

    var staggerButton = scriptWindow.add("button", undefined, "Stagger");

    function staggerLayers(frameOffset, useRandom) {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("No layers selected.");
            return;
        }

        app.beginUndoGroup("Stagger Layers");

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var timeOffset;

            if (useRandom) {
                var randomFrames = Math.floor(Math.random() * (frameOffset + 1));
                timeOffset = randomFrames / comp.frameRate;
            } else {
                timeOffset = (i * frameOffset) / comp.frameRate;
            }

            layer.startTime += timeOffset;
        }

        app.endUndoGroup();
    }

    function updateStaticText() {
        if (randomCheckbox.value) {
            staticText.text = "Max random frames (0 to this value)";
        } else {
            staticText.text = "# Frames between each layer";
        }
    }

    randomCheckbox.onClick = function () {
        updateStaticText();
    };

    function handleStaggerAndClose() {
        var frameOffset = parseInt(frameInput.text, 10);
        if (isNaN(frameOffset)) {
            alert("Please enter a valid number.");
            return;
        }
        staggerLayers(frameOffset, randomCheckbox.value);
        scriptWindow.close();
    }

    staggerButton.onClick = handleStaggerAndClose;

    scriptWindow.addEventListener("keydown", function (kd) {
        if (kd.keyName === "Enter") {
            handleStaggerAndClose();
        }
    });

    scriptWindow.center();
    scriptWindow.show();
})();
