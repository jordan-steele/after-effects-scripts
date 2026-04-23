/**
 * @name Version Up
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Version up selected comps in the project panel
 * @label VERSION
 * @shift-click Duplicates the comp
 * @cmd-click Version up letters
 * @changelog Update: Better regex to handle non-v version numbers
 */

(function versionUp() {
    var shiftHeld;
    var cmdHeld;
    if (ScriptUI.environment.keyboardState.shiftKey) {
        shiftHeld = true;
    }
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        cmdHeld = true;
    }
    try {
        var selectedComps = app.project.selection;
        var newComp;
        app.beginUndoGroup("Version Up");
        for (var i = 0; i < selectedComps.length; i++) {
            if (cmdHeld == true) {
                if (shiftHeld == true) {
                    newComp = selectedComps[i].duplicate();
                    selectedComps[i].label = 1;
                    newComp.name = selectedComps[i].name.substring(0, selectedComps[i].name.length - 1) + nextChar(selectedComps[i].name.substr(selectedComps[i].name.length - 1, 1));
                }
                selectedComps[i].name = selectedComps[i].name.substring(0, selectedComps[i].name.length - 1) + nextChar(selectedComps[i].name.substr(selectedComps[i].name.length - 1, 1));

                function nextChar(c) {
                    return String.fromCharCode(c.charCodeAt(0) + 1);
                }
            } else if (shiftHeld == true) {
                newComp = selectedComps[i].duplicate();
                selectedComps[i].label = 1;
            } else {
                versionUp(selectedComps[i]);
            }
        }
        app.endUndoGroup();

        function versionUp(comp) {
            var match = comp.name.match(/(_[a-zA-Z]*)(\d+)(?=\D*$)/);
            if (!match) {
                alert("No version number found in selected comp(s) name");
            } else {
                var prefix = match[1];
                var num = parseInt(match[2], 10) + 1;
                var padded = num.toString();
                while (padded.length < match[2].length) {
                    padded = "0" + padded;
                }
                comp.name = comp.name.replace(/(_[a-zA-Z]*)(\d+)(?=\D*$)/, prefix + padded);
            }
        }
    } catch (err) {}
})();
