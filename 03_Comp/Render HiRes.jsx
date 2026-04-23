/**
 * @name Render Hi-Res
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Add hi-res to render queue
 * @label HIGH
 * @alt-click Set render templates
 */

(function renderHiRes() {
    var scriptName = "JS Render HiRes";

    //-----------------Populate Render Settings & Output Modules----------------------//
    var RStemplates, OMtemplates;
    try {
        if (app.project.renderQueue.numItems > 0) {
            RStemplates = app.project.renderQueue.item(app.project.renderQueue.numItems).templates;
            OMtemplates = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates;
        } else {
            var dummyComp = app.project.items.addComp("_setting retrieval_", 1920, 1080, 1, 1, 23.976);
            var dummyRender = app.project.renderQueue.items.add(dummyComp);
            RStemplates = dummyRender.templates;
            OMtemplates = dummyRender.outputModule(1).templates;
            try {
                dummyComp.remove();
                dummyRender.remove();
            } catch (err) {}
        }
    } catch (err) {
        alert(err);
    }

    if (ScriptUI.environment.keyboardState.altKey) {
        setSettings();
        return;
    }

    //--------Load Saved Settings-------//
    var proceed = true;

    function loadTemplate(key, templates) {
        if (!app.settings.haveSetting(scriptName, key)) {
            setSettings();
            proceed = false;
            return "";
        }
        var saved = app.settings.getSetting(scriptName, key);
        for (var s = 0; s < templates.length; s++) {
            if (templates[s] == saved) {
                return templates[s];
            }
        }
        setSettings();
        proceed = false;
        return "";
    }

    function loadSuffix(key) {
        return app.settings.haveSetting(scriptName, key) ? app.settings.getSetting(scriptName, key).toString() : "";
    }

    var RS = loadTemplate("Click Render Settings", RStemplates);
    var OM = loadTemplate("Click Output Module", OMtemplates);
    var SUF = loadSuffix("Click Suffix");
    var shiftRS = loadTemplate("Shift-Click Render Settings", RStemplates);
    var shiftOM = loadTemplate("Shift-Click Output Module", OMtemplates);
    var shiftSUF = loadSuffix("Shift-Click Suffix");
    var cmdRS = loadTemplate("Cmd-Click Render Settings", RStemplates);
    var cmdOM = loadTemplate("Cmd-Click Output Module", OMtemplates);
    var cmdSUF = loadSuffix("Cmd-Click Suffix");

    var RStemplate, QTtemplate, suffix;
    if (ScriptUI.environment.keyboardState.metaKey || (File.fs == "Windows" && ScriptUI.environment.keyboardState.ctrlKey)) {
        RStemplate = cmdRS;
        QTtemplate = cmdOM;
        suffix = cmdSUF;
    } else if (ScriptUI.environment.keyboardState.shiftKey) {
        RStemplate = shiftRS;
        QTtemplate = shiftOM;
        suffix = shiftSUF;
    } else {
        RStemplate = RS;
        QTtemplate = OM;
        suffix = SUF;
    }

    //--------Add to Render Queue-------//
    if (proceed) {
        app.beginUndoGroup("Add To Render Queue");

        var activeItem = app.project.activeItem;
        var sel_vids = app.project.selection;
        var comps = activeItem instanceof CompItem ? [activeItem] : sel_vids;

        if (comps != null && comps[0] instanceof CompItem) {
            for (var i = 0; i < comps.length; i++) {
                var theRender = app.project.renderQueue.items.add(comps[i]);
                theRender.applyTemplate(RStemplate);
                theRender.outputModules[1].applyTemplate(QTtemplate);
                if (suffix != "") {
                    applySuffix(suffix);
                }
            }
        }

        app.endUndoGroup();
    }

    function applySuffix(suf) {
        var curOM = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1);
        var old = curOM.file.fsName;
        var len = old.length;
        curOM.file = new File(old.substring(len - 6, len - 5) == "_" ? old.substring(0, len - 6) + suf + old.substring(len - 4) : old.substring(0, len - 4) + suf + old.substring(len - 4));
    }

    function setSettings() {
        var win = new Window("dialog", "Hi-Res Render Settings", undefined);
        win.alignChildren = "left";
        var panel = win.add("panel");
        panel.alignChildren = "left";

        var header = panel.add("group");
        header.orientation = "row";
        header.spacing = [1, 5, 1, 5];
        header.add("statictext", { x: undefined, y: undefined, width: 80, height: 20 }, "");
        header.add("statictext", { x: undefined, y: undefined, width: 150, height: 20 }, "Render Settings");
        header.add("statictext", { x: undefined, y: undefined, width: 150, height: 20 }, "  Output Module");
        header.add("statictext", [0, 0, 60, 20], "    Suffix");

        function addRow(label) {
            var row = panel.add("group");
            row.orientation = "row";
            row.spacing = [1, 5, 1, 5];
            row.add("statictext", { x: undefined, y: undefined, width: 80, height: 20 }, label);
            var rs = row.add("dropdownlist", { x: undefined, y: undefined, width: 150, height: undefined });
            var om = row.add("dropdownlist", { x: undefined, y: undefined, width: 150, height: undefined });
            var suf = row.add("edittext", [0, 0, 60, 20], "");
            suf.helpTip = "Leave blank if you would like no suffix";
            return {
                rs: rs,
                om: om,
                suf: suf
            };
        }

        var reg = addRow("Click:");
        var shift = addRow("Shift-Click:");
        var cmd = addRow("Cmd-Click:");

        for (var a = 0; a < RStemplates.length; a++) {
            if (RStemplates[a].substring(0, 7) != "_HIDDEN") {
                reg.rs.add("item", RStemplates[a]);
                shift.rs.add("item", RStemplates[a]);
                cmd.rs.add("item", RStemplates[a]);
            }
        }
        for (var b = 0; b < OMtemplates.length; b++) {
            if (OMtemplates[b].substring(0, 7) != "_HIDDEN") {
                reg.om.add("item", OMtemplates[b]);
                shift.om.add("item", OMtemplates[b]);
                cmd.om.add("item", OMtemplates[b]);
            }
        }

        function preselectDropdown(dropdown, key) {
            if (!app.settings.haveSetting(scriptName, key)) {
                return;
            }
            var saved = app.settings.getSetting(scriptName, key);
            for (var s = 0; s < dropdown.items.length; s++) {
                if (dropdown.items[s].text == saved) {
                    dropdown.selection = s;
                    return;
                }
            }
        }

        preselectDropdown(reg.rs, "Click Render Settings");
        preselectDropdown(reg.om, "Click Output Module");
        preselectDropdown(shift.rs, "Shift-Click Render Settings");
        preselectDropdown(shift.om, "Shift-Click Output Module");
        preselectDropdown(cmd.rs, "Cmd-Click Render Settings");
        preselectDropdown(cmd.om, "Cmd-Click Output Module");
        if (app.settings.haveSetting(scriptName, "Click Suffix")) {
            reg.suf.text = app.settings.getSetting(scriptName, "Click Suffix").toString();
        }
        if (app.settings.haveSetting(scriptName, "Shift-Click Suffix")) {
            shift.suf.text = app.settings.getSetting(scriptName, "Shift-Click Suffix").toString();
        }
        if (app.settings.haveSetting(scriptName, "Cmd-Click Suffix")) {
            cmd.suf.text = app.settings.getSetting(scriptName, "Cmd-Click Suffix").toString();
        }

        var saveBtn = win.add("button", undefined, "Save Settings");
        saveBtn.alignment = "fill";
        saveBtn.onClick = function () {
            function save(key, value) {
                try {
                    app.settings.saveSetting(scriptName, key, value);
                } catch (err) {}
            }
            save("Click Render Settings", reg.rs.selection.text.toString());
            save("Click Output Module", reg.om.selection.text.toString());
            save("Click Suffix", reg.suf.text.toString());
            save("Shift-Click Render Settings", shift.rs.selection.text.toString());
            save("Shift-Click Output Module", shift.om.selection.text.toString());
            save("Shift-Click Suffix", shift.suf.text.toString());
            save("Cmd-Click Render Settings", cmd.rs.selection.text.toString());
            save("Cmd-Click Output Module", cmd.om.selection.text.toString());
            save("Cmd-Click Suffix", cmd.suf.text.toString());
            win.close();
        };

        win.show();
    }
})();
