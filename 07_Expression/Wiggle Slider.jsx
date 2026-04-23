/**
 * @name Wiggle Slider
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Expression
 * @description Adds a wiggle slider for the selected property(s)
 * @label WIGGLE
 * @shift-click Creates a wiggle null with sliders
 * @cmd-click Creates property specific sliders
 */

(function wiggle() {
    var myComp = app.project.activeItem;
    if (myComp instanceof CompItem && myComp.selectedProperties.length > 0) {
        app.beginUndoGroup("Add Wiggle");
        var shiftHeld = false;
        var cmdHeld = false;
        if (ScriptUI.environment.keyboardState.shiftKey) {
            shiftHeld = true;
        }
        if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
            cmdHeld = true;
        }
        for (var i = 0; i < myComp.selectedLayers.length; i++) {
            processLayer(myComp.selectedLayers[i]);
        }
        app.endUndoGroup();
    } else {
        alert("Please select a property to wiggle.\n\nShift-Click will create a new Wiggle Null with sliders and link the selected properties to those sliders.\n\nCmd-Click will apply the wiggle expression without sliders.");
    }

    function processLayer(layer) {
        var selProps = layer.selectedProperties,
            N = selProps.length,
            n,
            prop,
            saves = [],
            slider1,
            slider2,
            wiggleExpression,
            myNull;
        var slider1Name = "Wiggle Frequency";
        var slider2Name = "Wiggle Amount";

        if (shiftHeld == true && cmdHeld == false) {
            var numNulls = 1;
            for (var k = 1; k <= myComp.numLayers; k++) {
                if (myComp.layer(k).name.indexOf("Wiggle Null") != -1) {
                    numNulls++;
                }
            }
            myNull = myComp.layers.addNull();
            if (numNulls != 1) {
                myNull.name = "Wiggle Null " + numNulls;
                wiggleExpression = 'wiggle(thisComp.layer("Wiggle Null ' + numNulls + '").effect("' + slider1Name + '").slider,thisComp.layer("Wiggle Null ' + numNulls + '").effect("' + slider2Name + '").slider);';
            } else {
                myNull.name = "Wiggle Null";
                wiggleExpression = 'wiggle(thisComp.layer("Wiggle Null").effect("' + slider1Name + '").slider,thisComp.layer("Wiggle Null").effect("' + slider2Name + '").slider);';
            }
        } else {
            wiggleExpression = 'wiggle(effect("' + slider1Name + '").slider, effect("' + slider2Name + '").slider);';
        }

        for (n = 0; n < N; n++) {
            prop = selProps[n];
            if (prop.canSetExpression) {
                if (prop.propertyDepth > 2 && prop.propertyGroup(prop.propertyDepth - 2).isEffect) {
                    saves.push(getPropIndexPath(prop));
                } else {
                    saves.push(prop);
                }
            }
        }
        N = saves.length;
        if (N > 0) {
            if (shiftHeld == true) {
                slider1 = myNull.effect.addProperty("ADBE Slider Control");
                slider1.name = slider1Name;
                slider1.property(1).setValue(2);
                slider2 = myNull.effect.addProperty("ADBE Slider Control");
                slider2.name = slider2Name;
                slider2.property(1).setValue(50);
            } else if (shiftHeld == false && cmdHeld == false) {
                var hasEffect = false;
                for (var f = 1; f <= myComp.selectedLayers[0].property("Effects").numProperties; f++) {
                    if (myComp.selectedLayers[0].effect(f).name.indexOf("Wiggle") != -1) {
                        hasEffect = true;
                    }
                }
                if (hasEffect == false) {
                    slider1 = layer.effect.addProperty("ADBE Slider Control");
                    slider1.name = slider1Name;
                    slider1.property(1).setValue(2);
                    slider2 = layer.effect.addProperty("ADBE Slider Control");
                    slider2.name = slider2Name;
                    slider2.property(1).setValue(50);
                }
            }
            for (n = 0; n < N; n++) {
                prop = saves[n] instanceof Property ? saves[n] : getPropFromIndexPath(layer, saves[n]);
                if (cmdHeld == true) {
                    slider1Name = prop.name + " Wiggle Frequency";
                    slider2Name = prop.name + " Wiggle Amount";
                    slider1 = layer.effect.addProperty("ADBE Slider Control");
                    slider1.property(1).setValue(2);
                    slider1.name = slider1Name;
                    slider2 = layer.effect.addProperty("ADBE Slider Control");
                    slider2.property(1).setValue(50);
                    slider2.name = slider2Name;
                    wiggleExpression = 'wiggle(effect("' + slider1Name + '").slider, effect("' + slider2Name + '").slider);';
                    prop = saves[n] instanceof Property ? saves[n] : getPropFromIndexPath(layer, saves[n]);
                }
                try {
                    prop.expression = wiggleExpression;
                } catch (e) {
                    alert(e);
                }
            }
        }

        return;
    }

    function getPropIndexPath(prop) {
        var indices = [];
        while (prop.propertyDepth > 0) {
            indices.unshift(prop.propertyIndex);
            prop = prop.parentProperty;
        }
        indices.unshift(prop.index);
        return indices;
    }

    function getPropFromIndexPath(layer, indexPath) {
        var prop = layer,
            n = 0,
            N = indexPath.length;
        while (++n < N && (prop = prop.property(indexPath[n]))) {}
        return prop;
    }
})();
