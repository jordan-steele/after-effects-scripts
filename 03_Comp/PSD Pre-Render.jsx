/**
 * @name PSD Pre-Render
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Render a PSD of the current frame. Auto saves to 05_prerenders/PSD directory of the current project and imports again to the same comp.
 * @label PSD
 * @changelog Bug Fix: Fixed undo group mismatch error
 */

(function renderPSD() {
    var RS = "Best Settings";
    var OM = "_Photoshop_16bit";
    var padding = 7;

    function addToRenderQueue(comp, renderLocation, startTime) {
        try {
            var theRender = app.project.renderQueue.items.add(comp);

            if (theRender.outputModule(1).file == null && renderLocation == null) {
                throw new Error('Output Module is "Not yet specified". Please manually set a location to render to and try again.');
            }

            var RStemplates = app.project.renderQueue.item(1).templates;
            var OMtemplates = app.project.renderQueue.item(1).outputModule(1).templates;
            if (RStemplates.toString().search(RS) == "-1") {
                throw new Error("Render setting not found: " + RS + "\nCheck your render setting templates");
            }
            if (OMtemplates.toString().search(OM) == "-1") {
                throw new Error("Output module not found: " + OM + "\nCheck your output module templates");
            }

            if (theRender.outputModule(1).file == null) {
                theRender.outputModule(1).setSettings({
                    "Output File Info": { "Base Path": "~/", "File Template": "[compName].[fileExtension]" }
                });
            }

            var renderBaseFolder = renderLocation != null ? renderLocation : theRender.outputModule(1).file.parent;

            theRender.applyTemplate(RS);
            theRender.setSettings({
                "Time Span Start": startTime[0],
                "Time Span End": startTime[0] + startTime[1]
            });

            theRender.outputModules[1].applyTemplate(OM);
            var extension = theRender.outputModules[1].file.absoluteURI.split(".").pop();
            var modifiedName = comp.name + "." + extension;

            theRender.outputModule(1).setSettings({
                "Output File Info": {
                    "Base Path": renderBaseFolder.fsName,
                    "Subfolder Path": "",
                    "File Name": modifiedName
                },
                "Use Comp Frame Number": "true",
                Crop: false,
                Resize: false
            });

            return theRender;
        } catch (err) {
            alert(err);
        }
    }

    var project = app.project;

    if (project.file === null) {
        alert("The project hasn't been saved yet. Please save the project first.");
        return;
    }

    try {
        var prerenderFolder = new Folder(project.file.parent.absoluteURI + "/PSD");

        if (!prerenderFolder.exists) {
            prerenderFolder.create();
        }

        if (!(app.project.activeItem instanceof CompItem)) {
            app.activeViewer.setActive();
        }

        var activeItem = app.project.activeItem;
        var currentFrame = Math.floor(activeItem.time / activeItem.frameDuration + activeItem.displayStartTime / activeItem.frameDuration);
        var startTime = [activeItem.time, activeItem.frameDuration];

        var renderQueueItem = addToRenderQueue(activeItem, prerenderFolder, startTime);
        var renderFile = renderQueueItem.outputModule(1).file;

        function padNumber(number) {
            var str = number.toString();
            while (str.length < padding) {
                str = "0" + str;
            }
            return str;
        }

        function synthesizeFilename(fileObj, frame) {
            return fileObj.absoluteURI.replace(/%5B#+%5D/, padNumber(frame));
        }

        app.project.renderQueue.render();

        function importFile(file) {
            var importOptions = new ImportOptions();
            importOptions.file = new File(file);
            importOptions.sequence = false;
            return app.project.importFile(importOptions);
        }

        var importedItem = importFile(synthesizeFilename(renderFile, currentFrame));

        if (importedItem instanceof FootageItem && activeItem instanceof CompItem) {
            activeItem.layers.add(importedItem);
            app.activeViewer.setActive();
        }
    } catch (error) {
        alert("An error occurred: " + error.toString());
    }
})();
