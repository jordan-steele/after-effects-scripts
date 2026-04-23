/**
 * @name Default Folders
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Creates standard set of folders and sets project to OCIO 1.3 at 16bpc
 * @label FOLDER
 */

(function standardFolders() {
    app.beginUndoGroup("Create Standard Bins");
    var existFolder;
    var compsFolder;
    var footageFolder;
    if (checkExisting("01_comps") == false) {
        compsFolder = app.project.items.addFolder("01_comps");
    } else if (checkExisting("01_comps") == true) {
        compsFolder = existFolder;
    }
    if (checkExisting("00_precomps") == false) {
        var preCompsFolder = app.project.items.addFolder("00_precomps");
        preCompsFolder.parentFolder = compsFolder;
    }
    if (checkExisting("02_footage") == false) {
        footageFolder = app.project.items.addFolder("02_footage");
    } else if (checkExisting("02_footage") == true) {
        footageFolder = existFolder;
    }
    if (checkExisting("01_HiRes") == false) {
        var hiresFolder = app.project.items.addFolder("01_HiRes");
        hiresFolder.parentFolder = footageFolder;
    }
    if (checkExisting("02_ref") == false) {
        var refFolder = app.project.items.addFolder("02_ref");
        refFolder.parentFolder = footageFolder;
    }
    if (checkExisting("03_Stock") == false) {
        var stockFolder = app.project.items.addFolder("03_Stock");
        stockFolder.parentFolder = footageFolder;
    }
    if (checkExisting("03_elements") == false) {
        app.project.items.addFolder("03_elements");
    }
    if (checkExisting("04_prproj") == false) {
        app.project.items.addFolder("04_prproj");
    }
    if (checkExisting("05_3D") == false) {
        app.project.items.addFolder("05_3D");
    }
    if (checkExisting("08_prerenders") == false) {
        app.project.items.addFolder("08_prerenders");
    }
    if (checkExisting("09_ai") == false) {
        app.project.items.addFolder("09_ai");
    }
    if (checkExisting("10_autoslate") == false) {
        app.project.items.addFolder("10_autoslate");
    }

    app.project.colorManagementSystem = 0; //Adobe
    app.project.bitsPerChannel = 16;
    app.project.workingSpace = "e-sRGB";
    app.project.workingSpace = "";
    app.project.colorManagementSystem = 1; //OCIO
    app.project.ocioConfigurationFile = "ACES 1.3 Studio v1.0";

    app.endUndoGroup();

    function checkExisting(nameCheck) {
        var exists = false;
        for (var i = 1; i <= app.project.items.length; i++) {
            if (nameCheck == app.project.item(i).name) {
                exists = true;
                existFolder = app.project.item(i);
            }
        }
        return exists;
    }
})();
