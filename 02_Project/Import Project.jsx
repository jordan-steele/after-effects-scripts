/**
 * @name Import Project
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Import AE Project and merge folders with existing project structure
 * @label AE IMPORT
 */

(function importProject() {
    var importedProjs;
    if (File.fs == "Windows") {
        importedProjs = Folder.desktop.openDlg("Choose AE project(s) to import (.aep)", "Adobe After Effects Project:*.aep", true);
    } else {
        importedProjs = File.openDialog(
            "Choose AE project(s) to import (.aep)",
            function (file) {
                return file instanceof Folder || (!file.hidden && (file.name.match(/\.aep$/i) || file.type == "AEP "));
            },
            true
        );
    }

    if (importedProjs === null) {
        return;
    }

    var projMsg = "";
    for (var i = 0; i < importedProjs.length; i++) {
        var masterFolder = app.project.importFile(new ImportOptions(File(importedProjs[i])));
        app.beginUndoGroup("Import Project - Merge Folders");
        mergeFolderContents(masterFolder, app.project.rootFolder);
        projMsg += masterFolder.name + "\n";
        if (masterFolder.numItems == 0) {
            masterFolder.remove();
        }
        app.endUndoGroup();
    }

    var consolidatedItems = app.project.consolidateFootage();

    alert("Import completed successfully.\nImported Project(s):\n\n" + projMsg + "\n" + consolidatedItems + " footage or folder items were consolidated.");

    function mergeFolderContents(srcFolder, targetFolder) {
        for (var i = srcFolder.numItems; i >= 1; i--) {
            var item = srcFolder.item(i);
            if (!(item instanceof FolderItem)) {
                item.parentFolder = targetFolder;
            } else {
                var matchingSubFolder = null;
                for (var j = 1; j <= targetFolder.numItems; j++) {
                    var targetSubItem = targetFolder.item(j);
                    if (targetSubItem instanceof FolderItem && targetSubItem.name === item.name) {
                        matchingSubFolder = targetSubItem;
                        break;
                    }
                }
                if (matchingSubFolder !== null) {
                    mergeFolderContents(item, matchingSubFolder);
                    if (item.numItems === 0) {
                        item.remove();
                    }
                } else {
                    item.parentFolder = targetFolder;
                }
            }
        }
    }
})();
