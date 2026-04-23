/**
 * @name Track in Mocha
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Track in Mocha AE Plugin. Renames layer to "Mocha Track" and turns it brown.
 * @label MOCHA
 * @shift-click Mocha Pro Plugin
 * @cmd-click Mocha Pro Standalone
 */

(function trackInMocha() {
    var shiftHeld = false;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
    }
    var cmdHeld = false;
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        cmdHeld = true;
    }

    var myComp = app.project.activeItem;
    if (myComp == null) {
        alert("Please select an active comp");
        return;
    }
    if (cmdHeld == true) {
        copyToClipboard(myComp.name.toString());
    }
    var selectedLayers = myComp.selectedLayers;
    app.beginUndoGroup("Track in Mocha");
    if (selectedLayers.length > 1) {
        alert("Please only select 1 layer to track in Mocha");
    } else if (selectedLayers.length == 1) {
        var myLayer = selectedLayers[0];
        if (shiftHeld == true) {
            try {
                myLayer.Effects.addProperty("mochaProAE");
                myLayer.name = "Mocha Track";
                myLayer.label = 12;
            } catch (err) {
                myLayer.Effects.addProperty("mochaAECC");
                myLayer.name = "Mocha Track";
                myLayer.label = 12;
            }
        } //if
        else if (cmdHeld == true) {
            if (myLayer.source instanceof FootageItem) {
                if (parseInt(app.version, 10) < 16) {
                    app.executeCommand(app.findMenuCommandId("Track in mocha AE"));
                } else {
                    app.executeCommand(app.findMenuCommandId("Track in Boris FX Mocha"));
                }
            } else if (myLayer.source instanceof CompItem) {
                myLayer.source.openInViewer();
                var newComp = myLayer.source;
                var bottomLayer = newComp.layer(newComp.layers.length);
                for (var j = 1; j <= newComp.layers.length; j++) {
                    newComp.layer(j).selected = false;
                    var layerTest = newComp.layer(j).source;
                    if (layerTest instanceof FootageItem && layerTest.mainSource.color == null && layerTest.mainSource.file != null) {
                        bottomLayer = newComp.layer(j);
                    }
                }
                bottomLayer.selected = true;
                if (parseInt(app.version, 10) < 16) {
                    app.executeCommand(app.findMenuCommandId("Track in mocha AE"));
                } else {
                    app.executeCommand(app.findMenuCommandId("Track in Boris FX Mocha"));
                }
                app.executeCommand(app.findMenuCommandId("Close"));
            }
        } else {
            myLayer.Effects.addProperty("mochaAECC");
            myLayer.name = "Mocha Track";
            myLayer.label = 12;
        }
    } else if (selectedLayers.length < 1) {
        alert("Please select a layer to track in Mocha");
    }
    app.endUndoGroup();

    function copyToClipboard(string) {
        var cmd, isWindows;

        string = typeof string === "string" ? string : string.toString();
        isWindows = $.os.indexOf("Windows") !== -1;

        cmd = 'echo "' + string + '" | pbcopy';
        if (isWindows) {
            cmd = 'cmd.exe /c cmd.exe /c "echo ' + string + ' | clip"';
        }

        system.callSystem(cmd);
    }
})();
