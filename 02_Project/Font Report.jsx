/**
 * @name Font Report
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Scans project for fonts used and generates report
 * @label REPORT
 */

(function fontReport() {
    var project = app.project;
    if (!project) {
        alert("No project open.");
        return;
    }

    // Object to hold fonts and their unique composition hierarchies
    var fontsHierarchy = {};

    // Function to add a hierarchy path if it's not already included
    function addUniqueHierarchy(fontName, hierarchy) {
        if (!fontsHierarchy[fontName]) {
            fontsHierarchy[fontName] = [];
        }
        var exists = false;
        for (var i = 0; i < fontsHierarchy[fontName].length; i++) {
            if (fontsHierarchy[fontName][i] === hierarchy) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            fontsHierarchy[fontName].push(hierarchy);
        }
    }

    // Recursive function to scan compositions for fonts
    function scanComps(comp, hierarchy) {
        if (comp instanceof CompItem) {
            for (var j = 1; j <= comp.numLayers; j++) {
                var layer = comp.layer(j);
                if (layer instanceof TextLayer) {
                    var fontName = layer.property("Source Text").value.font;
                    addUniqueHierarchy(fontName, hierarchy);
                } else if (layer instanceof AVLayer && layer.source instanceof CompItem) {
                    scanComps(layer.source, hierarchy + " -> " + layer.source.name);
                }
            }
        }
    }

    app.beginUndoGroup("Scan Fonts");

    for (var i = 1; i <= project.numItems; i++) {
        var item = project.item(i);
        if (item instanceof CompItem && item.usedIn.length === 0) {
            scanComps(item, item.name);
        }
    }

    app.endUndoGroup();

    var results = "Fonts used in the project:\n";
    for (var font in fontsHierarchy) {
        if (fontsHierarchy.hasOwnProperty(font)) {
            results += font + ":\n";
            var paths = fontsHierarchy[font];
            for (var k = 0; k < paths.length; k++) {
                results += "  " + paths[k] + "\n";
            }
            results += "\n";
        }
    }

    // Create UI
    var win = new Window("palette", "Font Usage Report", undefined);
    win.orientation = "column";

    var text = win.add("edittext", undefined, "", {
        multiline: true,
        readonly: true,
        wantReturn: true
    });
    text.text = results;
    text.size = [300, 250];

    var copyBtn = win.add("button", undefined, "Copy to Clipboard");
    copyBtn.onClick = function () {
        var myTextString = "";
        var cmd, isWindows;
        isWindows = $.os.indexOf("Windows") !== -1;

        if (isWindows) {
            myTextString = text.text;
            cmd = 'cmd.exe /c cmd.exe /c "echo ' + myTextString + '| clip"';
        } else {
            myTextString = text.text.replace(/'/g, "'\\''");
            cmd = 'echo "' + myTextString + '" | pbcopy';
        }

        system.callSystem(cmd);
        alert("Copied to the clipboard");
    };

    win.center();
    win.show();
})();
