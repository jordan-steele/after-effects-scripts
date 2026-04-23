/**
 * @name Auto CDL
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Search for CDL matching comp name pattern of SHOW_000_001_010
 * @icon-text CDL
 * @changelog Bug Fix: Fixed CDL plugin match name
 */

(function autoCDL() {
    try {
        var regexPattern = /[a-zA-Z0-9]{1,6}_[a-zA-Z0-9]{1,6}_[a-zA-Z0-9]{1,6}_[a-zA-Z0-9]{1,6}/;

        function isPluginInstalled(pluginName) {
            var installedEffects = app.effects;
            for (var i = 0; i < installedEffects.length; i++) {
                if (installedEffects[i].matchName == pluginName) {
                    return true;
                }
            }
            return false;
        }

        function osCheck() {
            var op = $.os;
            var match = op.indexOf("Windows");
            return match != -1 ? "PC" : "MAC";
        }

        function customAlert(message, link) {
            var win = new Window("dialog", "Plugin Not Found");
            win.orientation = "column";
            win.alignChildren = ["center", "top"];
            win.spacing = 10;
            win.margins = 16;

            var messageText = win.add("statictext", undefined, message, {
                multiline: true
            });
            messageText.preferredSize.width = 300;

            var linkText = win.add("statictext", undefined, link);
            linkText.graphics.foregroundColor = linkText.graphics.newPen(linkText.graphics.PenType.SOLID_COLOR, [0, 0.5, 1], 1);

            var buttonGroup = win.add("group");
            buttonGroup.orientation = "row";
            buttonGroup.alignChildren = ["center", "center"];
            buttonGroup.spacing = 10;

            var openButton = buttonGroup.add("button", undefined, "Open in Browser");
            var okButton = buttonGroup.add("button", undefined, "OK");

            var userOSVer = osCheck();
            var urlLaunchCode = userOSVer == "MAC" ? "open" : "start";

            openButton.onClick = function () {
                system.callSystem(urlLaunchCode + " " + link);
            };

            okButton.onClick = function () {
                win.close();
            };

            win.show();
        }

        var pluginMatchName = "fnord CDL";

        if (!isPluginInstalled(pluginMatchName)) {
            var message = "The plugin '" + pluginMatchName + "' is not installed.\nPlease visit this link to download it:";
            var link = "https://fnordware.blogspot.com/2024/04/cdl-for-after-effects.html";
            customAlert(message, link);
            return;
        }

        var searchFolder = getParentFolderOfProject();
        if (searchFolder) {
            var comps = app.project.selection;

            if (comps != null) {
                app.beginUndoGroup("Auto CDL");
                try {
                    for (var j = 0; j < comps.length; j++) {
                        var curComp = comps[j];
                        var matches = curComp.name.match(regexPattern);
                        if (matches) {
                            var formattedName = curComp.name.match(regexPattern)[0];
                            var foundFile = searchForCDLFileWithTermInName(searchFolder, formattedName);
                            if (!foundFile && searchFolder.parent) {
                                foundFile = searchForCDLFileWithTermInName(searchFolder.parent, formattedName);
                            }
                            if (foundFile) {
                                addCDL(foundFile, curComp);
                            } else {
                                alert("No .cdl file containing '" + formattedName + "' found in the folder names.");
                            }
                        } else {
                            alert("Comp name doesn't match search pattern\n" + regexPattern.toString());
                        }
                    }
                } catch (err) {
                    alert(err.message);
                } finally {
                    app.endUndoGroup();
                }
            } else {
                return alert("Please select some comps to search for.");
            }
        }

        // Function to get the parent parent folder of the currently open project
        function getParentFolderOfProject() {
            var project = app.project;

            if (!project) {
                alert("No project is currently open.");
                return null;
            }

            var projectFile = project.file;

            if (!projectFile) {
                alert("The project has not been saved.");
                return null;
            }

            var projectFolderPath = projectFile.parent.parent;

            return projectFolderPath;
        }

        function searchForCDLFileWithTermInName(startFolder, searchTerm) {
            if (!startFolder || !searchTerm) {
                return null; // Invalid input
            }

            var folder = new Folder(startFolder);
            var files = folder.getFiles(function (file) {
                return file instanceof File && file.name.match(/\.cdl$/i) && file.name.indexOf(searchTerm) !== -1;
            });

            // Sort the matching files alphabetically by name
            files.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

            if (files.length > 0) {
                return files[0]; // Return the first matching .cdl file found (sorted)
            }

            var subFolders = folder.getFiles(function (subFolder) {
                return subFolder instanceof Folder;
            });

            for (var j = 0; j < subFolders.length; j++) {
                var subFolder = subFolders[j];
                var foundFile = searchForCDLFileWithTermInName(subFolder.fsName, searchTerm);
                if (foundFile) {
                    return foundFile;
                }
            }

            return null; // Search term not found in any .cdl file name
        }

        function addCDL(selectedFile, myComp) {
            try {
                selectedFile.open("r");
                var cdlContents = selectedFile.read();
                selectedFile.close();

                var cdlObj = parseCDL(cdlContents);

                if (cdlObj == null) {
                    alert("No CDL data found:\n" + selectedFile.fsName);
                } else {
                    var mySolid = myComp.layers.addSolid([0.2, 0.2, 0.2], "CDL-" + selectedFile.name, myComp.width, myComp.height, 1);
                    mySolid.startTime = 0;

                    var cdlEffect = mySolid.effect.addProperty("fnord CDL");
                    cdlEffect.name = selectedFile.displayName;

                    cdlEffect.property("Red Slope").setValue(cdlObj.redSlope);
                    cdlEffect.property("Green Slope").setValue(cdlObj.greenSlope);
                    cdlEffect.property("Blue Slope").setValue(cdlObj.blueSlope);

                    cdlEffect.property("Red Offset").setValue(cdlObj.redOffset);
                    cdlEffect.property("Green Offset").setValue(cdlObj.greenOffset);
                    cdlEffect.property("Blue Offset").setValue(cdlObj.blueOffset);

                    cdlEffect.property("Red Power").setValue(cdlObj.redPower);
                    cdlEffect.property("Green Power").setValue(cdlObj.greenPower);
                    cdlEffect.property("Blue Power").setValue(cdlObj.bluePower);

                    cdlEffect.property("Saturation").setValue(cdlObj.sat);

                    mySolid.adjustmentLayer = true;
                    mySolid.guideLayer = true;
                    mySolid.label = 0;

                    for (var i = 1; i <= myComp.numLayers; i++) {
                        var layer = myComp.layer(i);
                        if (layer.name == "LUT") {
                            mySolid.moveAfter(layer);
                        } //if
                    } //for
                }
            } catch (err) {
                alert(err);
            }
        } //function addCDL

        function parseCDL(text) {
            try {
                var cdlObj = {};
                if (text.search("<Slope>") == -1) {
                    return null;
                } else {
                    var cdlSplit1 = text.split("<Slope>");
                    var cdlSlope = cdlSplit1[1].split(" ");
                    cdlObj.redSlope = parseFloat(cdlSlope[0]);
                    cdlObj.greenSlope = parseFloat(cdlSlope[1]);
                    cdlObj.blueSlope = parseFloat(cdlSlope[2]);
                    var cdlSplit2 = text.split("<Offset>");
                    var cdlOffset = cdlSplit2[1].split(" ");
                    cdlObj.redOffset = parseFloat(cdlOffset[0]);
                    cdlObj.greenOffset = parseFloat(cdlOffset[1]);
                    cdlObj.blueOffset = parseFloat(cdlOffset[2]);
                    var cdlSplit3 = text.split("<Power>");
                    var cdlPower = cdlSplit3[1].split(" ");
                    cdlObj.redPower = parseFloat(cdlPower[0]);
                    cdlObj.greenPower = parseFloat(cdlPower[1]);
                    cdlObj.bluePower = parseFloat(cdlPower[2]);
                    var satSplit1 = text.split("<Saturation>");
                    var satSplit2 = satSplit1[1].split("</Saturation>");
                    cdlObj.sat = parseFloat(satSplit2);

                    return cdlObj;
                }
            } catch (err) {
                alert(err);
            }
        } //function parseCDL
    } catch (err) {
        alert(err);
    }
})();
