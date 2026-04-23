/**
 * @name Blink
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Expression
 * @description Adds a blinking expression to the opacity with adjustable sliders
 * @label BLINK
 * @shift-click Uses a blink that fades between start opacity and 0
 */

(function blink() {
    var shiftheld;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftheld = true;
    }
    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    app.beginUndoGroup("Add Blink");
    if (myComp.selectedLayers.length != 0) {
        for (var i = 0; i < myComp.selectedLayers.length; i++) {
            processLayer(myComp.selectedLayers[i]);
        }
    } else {
        alert("Please select a layer");
    }
    app.endUndoGroup();

    function processLayer(layer) {
        var blinkExpression;
        var slider1;
        var slider3;
        if (shiftheld) {
            blinkExpression =
                "start = thisLayer.inPoint;\n" +
                'fadeTime = effect("Fade Time (In Frames)")("Slider") * thisComp.frameDuration;\n' +
                'delayTime = effect("Delay (In Frames)")("Slider") * thisComp.frameDuration;\n' +
                'holdTime = effect("Hold Time (In Frames)")("Slider") * thisComp.frameDuration;\n' +
                'startOpacity = effect("Start Opacity")("Slider");\n' +
                "\n" +
                "while (true) {\n" +
                "    holdStart = start;\n" +
                "    fadeStart = holdStart + holdTime;\n" +
                "    delayStart = fadeStart + fadeTime;\n" +
                "    nextStart = delayStart + delayTime;\n" +
                "\n" +
                "    if (time >= holdStart && time < fadeStart) {\n" +
                "        l = startOpacity;\n" +
                "        break;\n" +
                "    } else if (time >= fadeStart && time < delayStart) {\n" +
                '        if (effect("Ease")("Checkbox") == true) {\n' +
                "            l = ease(time, fadeStart, delayStart, startOpacity, 0);\n" +
                "        } else {\n" +
                "            l = linear(time, fadeStart, delayStart, startOpacity, 0);\n" +
                "        }\n" +
                "        break;\n" +
                "    } else if (time >= delayStart && time < nextStart) {\n" +
                "        l = 0;\n" +
                "        break;\n" +
                "    }\n" +
                "    start = nextStart;\n" +
                "}\n" +
                "\n" +
                "l";
            slider1 = layer.effect.addProperty("ADBE Slider Control");
            slider1.name = "Start Opacity";
            slider1.property(1).setValue(100);
            slider3 = layer.effect.addProperty("ADBE Slider Control");
            slider3.name = "Hold Time (In Frames)";
            slider3.property(1).setValue(10);
            var slider2 = layer.effect.addProperty("ADBE Slider Control");
            slider2.name = "Fade Time (In Frames)";
            slider2.property(1).setValue(10);
            slider3 = layer.effect.addProperty("ADBE Slider Control");
            slider3.name = "Delay (In Frames)";
            slider3.property(1).setValue(0);
            var checkbox = layer.effect.addProperty("ADBE Checkbox Control");
            checkbox.name = "Ease";
        } else {
            blinkExpression =
                'start = thisLayer.inPoint;\ninterval = effect("Delay (In Frames)")("Slider") * thisComp.frameDuration;\nstartOpacity = effect("Start Opacity")("Slider");\n\nwhile (start <= (time - (1 * thisComp.frameDuration))) {\n    start += interval + 1 * thisComp.frameDuration;\n}\n\nif (Math.floor((time - thisLayer.inPoint) / interval) % 2 == 0) {\n    l = startOpacity;\n} else {\n    l = 0;\n}\n\nl';
            slider1 = layer.effect.addProperty("ADBE Slider Control");
            slider1.name = "Start Opacity";
            slider1.property(1).setValue(100);
            slider3 = layer.effect.addProperty("ADBE Slider Control");
            slider3.name = "Delay (In Frames)";
            slider3.property(1).setValue(10);
        }
        layer.transform.opacity.expression = blinkExpression;
    }
})();
