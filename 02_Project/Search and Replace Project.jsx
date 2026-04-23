/**
 * @name Search & Replace
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Search and replace names in selected project items
 * @label SEARCH
 */

(function searchAndReplaceProject() {
    function searchAndReplaceProjectItems(searchText, replaceText) {
        app.beginUndoGroup("Search & Replace Project");
        var project = app.project;
        var selectedItems = project.selection;

        if (selectedItems.length === 0) {
            alert("Please select one or more items in the Project panel.");
            return;
        }

        for (var i = 0; i < selectedItems.length; i++) {
            var item = selectedItems[i];

            if (item.name.indexOf(searchText) !== -1) {
                // Replace the text in the item's name
                item.name = item.name.replace(searchText, replaceText);
            }
        }
        app.endUndoGroup();
    }

    var replaceIconBinary =
        '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x00\x01\x00\x00\x00\x01\x00O%\u00C4\u00D6\x00\x00\x00$zTXtCreator\x00\x00\b\u0099sL\u00C9OJUpL+I-RpMKKM.)\x06\x00Az\x06\u00CEjz\x15\u00C5\x00\x00\x00\u0095IDAT8\u008D\u00DD\u00D0\u00B1\t\x02A\x10\u0085\u00E1O\u00B1\x021\x11l\u00C1X\f\u00B5\x06\u0091\x05;042\u00B0\x07\u00DB\x18\u00D0\x0E\x041\u00B0\x00\u00C1\u00C8\u00DC2\x04M<\u0090\u00E3N\x16.\u00BB\x1F6y\u00B3\u00F3\u00E6\u00CD\u00D0N"b\x16\x11\u00C3\u009C\u00BF\u00DD\x1A}\u008FI\x13\u0083l\u00B2\f"b\x17\x11\u00E3&\t^8W\u0099tj&\u00DEp\u00C4\u00F5G\u00DE`\u008AyJ\u00E9^\u0088\u00BD\u009A\u0089\x0F,\u00BE\u00AF\u00A0\u008F\x01V\u00D8\u00FEMP\u0091h\u0084\x0BNX\u00A7\u0094\u00DEE-\u00F7\x06\u0087\u00AAf\u00EAW(\u00B3\u00C4\u00B3\u00DC\u00DC\x12>\u0090\x1D$/\u009F\u00E8\u00F7\u008B\x00\x00\x00\x00IEND\u00AEB`\u0082';
    var findreverseIconBinary =
        "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x00\x01\x00\x00\x00\x01\x00O%\u00C4\u00D6\x00\x00\x00$zTXtCreator\x00\x00\b\u0099sL\u00C9OJUpL+I-RpMKKM.)\x06\x00Az\x06\u00CEjz\x15\u00C5\x00\x00\x00\u00CCIDAT8\u008D\u00E5\u00D0\u00B1+\u00C4q\x1C\u00C6\u00F1\u00D7\x0F\u0085R\x16\x13\u00EBe0\u00A8\u00FB\x03\u0098,R\u00E6'\u00BB\u00C5d\u00F0g\x18\u00ECV\u00F1\u0099\r\u00CC\u008C\x16\u00BB\u00AC\fJR\n\u0083X\u00EE\u00EA\u00BA\u00EE\u00CE\u00AD\u00F2\u008C\u00CF\u00E7\u00F3~>\u00CF\u00F7\u00CB\u009FW3jXUs\u00D8\u00C0\f\u00AE\u0093<\u008E\x1DPUm\\\u00E2\t\u00AFhc7\u00C9Y\u00EF\u00DE\u00C4\u0088\x02'8L\u00B2\u009Ad\r[8\u00AE\u00AA\u00C5_\x03\u00AAj\t-\x1Cu\u00BD$W\u00B8\u00C5\u00FA8\r>1\u0089\u00D9>\x7F\x1E\x1F\u00BD\u00C6\u00A8?\u00B8\u00E0\u00FB\u0099f\x0F\u00EF\u00D8\u00C7\x01ZI\u00DE\u00BA{SC\u00E0m,\u00D3\u00DC\u00E1\x05_\u00B8\u00C7f/<\u00B0A\x07>\u00C5N\u0092\u00F3\u00AAZ\u00C0t\u0092\u0087A\u00C7\u009A>x\x057]x\u00D8\u00F3F\u00AA\x13\u00F2\u009F\u00F4\x03\u00B5*;\u00D26\u00E0\u0092b\x00\x00\x00\x00IEND\u00AEB`\u0082";

    // Create and show the UI
    var dialog = new Window("dialog", "Search and Replace Project Items");
    dialog.orientation = "column";
    dialog.preferredSize = [300, 150];

    var searchGroup = dialog.add("group");
    searchGroup.alignment = ["fill", "top"];
    searchGroup.add("image", [undefined, undefined, 18, 24], findreverseIconBinary);
    var searchInput = searchGroup.add("edittext", undefined, "");
    searchInput.active = true;
    searchInput.alignment = ["fill", "top"];

    var replaceGroup = dialog.add("group");
    replaceGroup.alignment = ["fill", "top"];
    replaceGroup.add("image", [undefined, undefined, 18, 24], replaceIconBinary);
    var replaceInput = replaceGroup.add("edittext", undefined, "");
    replaceInput.alignment = ["fill", "top"];

    var buttonGroup = dialog.add("group");
    var runButton = buttonGroup.add("button", undefined, "Run");
    buttonGroup.add("button", undefined, "Cancel");

    // Function to handle the button click event
    runButton.onClick = function () {
        var searchText = searchInput.text;
        var replaceText = replaceInput.text;
        searchAndReplaceProjectItems(searchText, replaceText);
        dialog.close();
    };

    // Function to handle the Enter key press event
    dialog.addEventListener("keydown", function (event) {
        if (event.keyName === "Enter") {
            runButton.onClick(); // Simulate a button click when Enter is pressed
        }
    });

    // Check selection before showing UI
    if (app.project.selection.length === 0) {
        alert("Please select one or more items in the Project panel.");
        return;
    }

    // Show the UI
    dialog.show();
})();
