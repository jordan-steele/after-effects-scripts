/**
 * @name Ignore Alpha
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Ignore alpha for selected footage in the project panel
 * @label IGNORE
 */

(function ignoreAlpha() {
    var project = app.project;
    var selectedItems = project.selection;

    if (selectedItems.length === 0) {
        alert("Please select one or more footage items in the Project panel.");
        return;
    }

    for (var i = 0; i < selectedItems.length; i++) {
        var item = selectedItems[i];

        if (item instanceof FootageItem) {
            if (item.mainSource instanceof FileSource) {
                item.mainSource.alphaMode = AlphaMode.IGNORE;
            }
        }
    }
})();
