/**
 * @name Scale Comps
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Scale one or more selected compositions and all layers within them. Select comps in the Project panel before running, or leave a comp open to scale just that one.
 *   Adapted from the Scale Composition script included with After Effects.
 * @label SCALE
 */

(function scaleComps() {
    var scaleFactor = 1.0;

    function getTargetComps() {
        var comps = [];
        var sel = app.project.selection;
        for (var i = 0; i < sel.length; i++) {
            if (sel[i] instanceof CompItem) { comps.push(sel[i]); }
        }
        if (comps.length == 0) {
            var active = app.project.activeItem;
            if (active != null && active instanceof CompItem) { comps.push(active); }
        }
        return comps;
    }

    function testNewScale(comp, sf) {
        return (sf * comp.width >= 1 && sf * comp.width <= 30000 &&
                sf * comp.height >= 1 && sf * comp.height <= 30000);
    }

    function makeParentLayerOfAllUnparented(theComp, newParent) {
        for (var i = 1; i <= theComp.numLayers; i++) {
            var layer = theComp.layer(i);
            var wasLocked = layer.locked;
            layer.locked = false;
            if (layer != newParent && layer.parent == null) { layer.parent = newParent; }
            layer.locked = wasLocked;
        }
    }

    function scaleAllCameraZooms(theComp, sf) {
        for (var i = 1; i <= theComp.numLayers; i++) {
            var layer = theComp.layer(i);
            if (layer.matchName == "ADBE Camera Layer") {
                var zoom = layer.zoom;
                if (zoom.numKeys == 0) {
                    zoom.setValue(zoom.value * sf);
                } else {
                    for (var j = 1; j <= zoom.numKeys; j++) {
                        zoom.setValueAtKey(j, zoom.keyValue(j) * sf);
                    }
                }
            }
        }
    }

    function scaleComp(activeComp, sf) {
        var null3DLayer = activeComp.layers.addNull();
        null3DLayer.threeDLayer = true;
        null3DLayer.position.setValue([0, 0, 0]);
        makeParentLayerOfAllUnparented(activeComp, null3DLayer);
        activeComp.width = Math.floor(activeComp.width * sf);
        activeComp.height = Math.floor(activeComp.height * sf);
        scaleAllCameraZooms(activeComp, sf);
        var newScale = null3DLayer.scale.value;
        newScale[0] = newScale[0] * sf;
        newScale[1] = newScale[1] * sf;
        newScale[2] = newScale[2] * sf;
        null3DLayer.scale.setValue(newScale);
        null3DLayer.remove();
    }

    function createUI(firstComp) {
        var dialog = new Window("dialog", "Scale Comps");
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;

        dialog.add("statictext", undefined, "Scale composition(s) using:");

        var scaleRadio = dialog.add("radiobutton", undefined, "New Scale Factor");
        var widthRadio = dialog.add("radiobutton", undefined, "New Comp Width");
        var heightRadio = dialog.add("radiobutton", undefined, "New Comp Height");
        scaleRadio.value = true;

        var inputGroup = dialog.add("group");
        inputGroup.alignment = ["left", "top"];
        var textInput = inputGroup.add("edittext", undefined, "1.0");
        textInput.preferredSize = [80, 20];

        var btnGroup = dialog.add("group");
        btnGroup.alignment = ["center", "top"];
        btnGroup.add("button", undefined, "Scale", { name: "ok" });
        btnGroup.add("button", undefined, "Cancel", { name: "cancel" });

        function updateInput() {
            if (scaleRadio.value) {
                textInput.text = scaleFactor;
            } else if (widthRadio.value) {
                textInput.text = Math.floor(firstComp.width * scaleFactor);
            } else {
                textInput.text = Math.floor(firstComp.height * scaleFactor);
            }
        }

        scaleRadio.onClick = function () { updateInput(); };
        widthRadio.onClick = function () { updateInput(); };
        heightRadio.onClick = function () { updateInput(); };

        textInput.onChange = function () {
            var value = parseFloat(this.text);
            if (isNaN(value)) {
                alert(this.text + " is not a number. Please enter a number.");
                updateInput();
                return;
            }
            var newSF;
            if (scaleRadio.value) {
                newSF = value;
            } else if (widthRadio.value) {
                newSF = value / firstComp.width;
            } else {
                newSF = value / firstComp.height;
            }
            if (testNewScale(firstComp, newSF)) {
                scaleFactor = newSF;
            } else {
                alert("Value will make height or width out of range 1 to 30000. Reverting to previous value.");
                updateInput();
            }
        };

        return dialog.show() == 1;
    }

    var comps = getTargetComps();
    if (comps.length == 0) {
        alert("Please select one or more compositions first.");
        return;
    }

    if (!createUI(comps[0])) { return; }

    for (var i = 0; i < comps.length; i++) {
        if (!testNewScale(comps[i], scaleFactor)) {
            alert('Scale factor is out of range for comp "' + comps[i].name + '". Aborting.');
            return;
        }
    }

    var label = comps.length == 1 ? "Scale Comp" : "Scale Comps (" + comps.length + " comps)";
    app.beginUndoGroup(label);
    try {
        for (var j = 0; j < comps.length; j++) {
            scaleComp(comps[j], scaleFactor);
        }
    } catch (err) {
        alert("An error occurred: " + err.toString());
    } finally {
        app.endUndoGroup();
    }
})();
