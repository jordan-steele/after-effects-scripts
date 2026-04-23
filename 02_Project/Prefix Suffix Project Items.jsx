/**
 * @name Prefix Suffix
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Project
 * @description Add a prefix or suffix to the names of selected project items
 * @label PREFIX
 */

(function addPrefixAndSuffix() {
    function addPrefixAndSuffixToProjectItems(prefixText, suffixText) {
        app.beginUndoGroup("Add Prefix/Suffix to Project");
        var project = app.project;
        var selectedItems = project.selection;

        if (selectedItems.length === 0) {
            alert("Please select one or more items in the Project panel.");
            return;
        }

        for (var i = 0; i < selectedItems.length; i++) {
            var item = selectedItems[i];

            // Add the prefix and suffix to the item's name
            item.name = prefixText + item.name + suffixText;
        }
        app.endUndoGroup();
    }

    var Left_Prefixpng =
        "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x18\x00\x00\x00\x18\b\x06\x00\x00\x00\u00E0w=\u00F8\x00\x00\x00\tpHYs\x00\x00\x00\x01\x00\x00\x00\x01\x00O%\u00C4\u00D6\x00\x00\x00$zTXtCreator\x00\x00\b\u0099sL\u00C9OJUpL+I-RpMKKM.)\x06\x00Az\x06\u00CEjz\x15\u00C5\x00\x00\x00\u0097IDATH\u0089\u00ED\u00D51\n\u00C2@\x18D\u00E1\u00F7\u008B\u00A5X\b\u009E\u00C6.\u0095`\u00E1\x1D<\u0085Un%X\u00A5\u00F50\u00E9\u00F4\x00\u00CF&\u0085H\u0082f\u00DD\u0085\u0080\u0099rY\u00E6c\u008AeaN\u00EE\u00A8\x1Bu\u00FD\u00ED\u00FDE\u0082Q\x03\u00A7\u0092\u00C0\u00A8\u00FC\x01\u00A0\u00AE\u008A\x01\u00EA\x16\u00B8\u00A9\u00FB\u00EC@W\u00DE\x00\u0097\u0088\u00B8f\x05\u00DE\u00CA\u00CF\u00A9\u00E5\u0083@\u00CE,\u00FB\x0E#\u00A2U+\u00A0Q\u00F9e\u00C5\u00E0\u0082\u0088h\u0081\n8\u00A8\u00C7T\u00A0w\u00C1+\u00A2\u00EE\u0080G\x11\u00A0C\u00EE\u00A9\u00E50\u0085\u0097<y`t\u00C6~8s>\u00E6\t>V4\u00DA\u0087)\u0093)\x00\x00\x00\x00IEND\u00AEB`\u0082";
    var Right_Suffixpng =
        '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x18\x00\x00\x00\x18\b\x06\x00\x00\x00\u00E0w=\u00F8\x00\x00\x00\tpHYs\x00\x00\x00\x01\x00\x00\x00\x01\x00O%\u00C4\u00D6\x00\x00\x00$zTXtCreator\x00\x00\b\u0099sL\u00C9OJUpL+I-RpMKKM.)\x06\x00Az\x06\u00CEjz\x15\u00C5\x00\x00\x00\u0092IDATH\u0089\u00ED\u00951\n\u00C2P\x10\x05\u00E7\u0089\u00A5X\b^\u00C8J\u00B0\u00F0\x0E\u009E\u00C2\u00CA\u00DA\u00F3\b\u0082\u0095\u0096\x1E\u00C6\u00CE\x0B\u008CM*\u0091\u00C4\u00FC\x18\b\u0098\u00A9\u00DF\u00EE,\u00BCba\u00E4W\u00A8su\u00D1vn\u00D2"\u00BB\x03\x0E}\n\u008A\u00F8s\u0081:\u00EBM\u00A0\u00AE\u0081\u00BB\u00BA\u00ECE\u0090\u00E4\x02\u009C\u0081k\u009DdZ*\u00A8${\u0095J\u00B2J\u00F2x\u00CF\f\u00BE\u00E4#\u00B0\x01>^\u00DFI\u00A0n\u009B\u0096C\u00B7\x0EN\u00C0-\u00C9\u00B3.T,H"P\u00BB\x1C\u0086^\u00F2 \x04_S\u00FApF\x1Ay\x01M\u00A33&\u00AE\u00B1\x16\u00B0\x00\x00\x00\x00IEND\u00AEB`\u0082';

    // Create and show the UI
    var dialog = new Window("dialog", "Add Prefix and Suffix to Project Items");
    dialog.orientation = "column";
    dialog.preferredSize = [300, 150];

    var prefixGroup = dialog.add("group");
    prefixGroup.alignment = ["fill", "top"];
    prefixGroup.add("image", undefined, Left_Prefixpng);
    var prefixInput = prefixGroup.add("edittext", undefined, "");
    prefixInput.alignment = ["fill", "top"];

    var suffixGroup = dialog.add("group");
    suffixGroup.alignment = ["fill", "top"];
    suffixGroup.add("image", undefined, Right_Suffixpng);
    var suffixInput = suffixGroup.add("edittext", undefined, "");
    suffixInput.alignment = ["fill", "top"];
    suffixInput.active = true;

    var buttonGroup = dialog.add("group");
    var runButton = buttonGroup.add("button", undefined, "Run");
    buttonGroup.add("button", undefined, "Cancel");

    // Function to handle the button click event
    runButton.onClick = function () {
        var prefixText = prefixInput.text;
        var suffixText = suffixInput.text;
        addPrefixAndSuffixToProjectItems(prefixText, suffixText);
        dialog.close();
    };

    // Function to handle the Enter key press event
    dialog.addEventListener("keydown", function (event) {
        if (event.keyName === "Enter") {
            runButton.onClick(); // Simulate a button click when Enter is pressed
        }
    });

    // Show the UI
    dialog.show();
})();
