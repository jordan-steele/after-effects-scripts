/**
 * @name Reduce & Keep Folders
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Reduce project but keep all folders
 * @label REDUCE
 * @shift-click Regular reduce project
 */

(function reduceKeepFolders() {
    function reduceAndKeepFolders() {
        app.beginUndoGroup("Reduce & Keep Folders");

        if (app.project.selection.length == 0) {
            alert("Please select at least one item to keep");
            return;
        }

        var projFolders = [];
        var i;
        for (i = 1; i <= app.project.numItems; i++) {
            if (app.project.item(i) instanceof FolderItem) {
                projFolders.push({
                    name: app.project.item(i).name,
                    id: app.project.item(i).id,
                    parent: {
                        obj: app.project.item(i).parentFolder,
                        name: app.project.item(i).parentFolder.name,
                        id: app.project.item(i).parentFolder.id
                    }
                });
            }
        }

        app.project.reduceProject(app.project.selection);

        for (i = 0; i < projFolders.length; i++) {
            if (!isInProject(projFolders[i], app.project)) {
                var newFolder = app.project.items.addFolder(projFolders[i].name);
                updateParentIds(projFolders, projFolders[i].id, newFolder);
                projFolders[i].id = newFolder.id;
                if (projFolders[i].parent.id != 0 && !isInProject(projFolders[i].parent, app.project)) {
                    projFolders[i].parent.obj = app.project.items.addFolder(projFolders[i].parent.name);
                    projFolders[i].parent.id = projFolders[i].parent.obj.id;
                }
                if (projFolders[i].parent.id != 0) {
                    newFolder.parentFolder = projFolders[i].parent.obj;
                }
            }
        }

        app.endUndoGroup();

        function isInProject(needle, haystack) {
            for (var i = 1; i <= haystack.numItems; i++) {
                if (needle.id == haystack.item(i).id) {
                    return true;
                }
            }
            return false;
        }

        function updateParentIds(arr, oldId, newFolder) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].parent.id == oldId) {
                    arr[i].parent.obj = newFolder;
                    arr[i].parent.id = newFolder.id;
                }
            }
        }
    }

    if (ScriptUI.environment.keyboardState.shiftKey) {
        if (app.project.selection != 0) {
            app.beginUndoGroup("Reduce Project");
            var num = app.project.reduceProject(app.project.selection);
            alert(num + " items that were not used by the selected items have been deleted. You can undo if desired.\nWARNING: items referenced ONLY by expressions are not preserved.");
        } else {
            alert("Please select at least one item to keep");
        }
    } else {
        reduceAndKeepFolders();
    }
})();
