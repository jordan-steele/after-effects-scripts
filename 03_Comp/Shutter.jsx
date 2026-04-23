/**
 * @name Shutter
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Comp
 * @description Set shutter angle and phase for motion blur
 * @label SHUTTER
 */

(function shutter() {
    var myComp = app.project.activeItem;
    var globalAngle = 180;
    var globalPhase = -90;
    var changeAll = false;

    // Pre-populate from active comp if available
    if (myComp instanceof CompItem) {
        globalAngle = myComp.shutterAngle;
        globalPhase = myComp.shutterPhase;
    }

    if (createUI()) {
        app.beginUndoGroup("Change Comp Shutter");
        if (changeAll == true) {
            for (var i = 1; i <= app.project.numItems; i++) {
                myComp = app.project.item(i);
                try {
                    myComp.shutterAngle = globalAngle;
                    myComp.shutterPhase = globalPhase;
                } catch (err) {
                    //do nothing
                }
            }
        } else {
            if (!(myComp instanceof CompItem)) {
                alert("Please select an active comp");
                app.endUndoGroup();
                return;
            }
            myComp.shutterAngle = globalAngle;
            myComp.shutterPhase = globalPhase;
        }
        app.endUndoGroup();
    }

    function createUI() {
        var my_dialog = new Window("dialog", "Change Comp Shutter");
        my_dialog.bounds = { x: 200, y: 200, width: 200, height: 180 };

        my_dialog.add("statictext", { x: 25, y: 30, width: 100, height: 15 }, "Shutter Angle: ");
        var shutterAngleInput = my_dialog.add("edittext", { x: 130, y: 28, width: 40, height: 20 }, globalAngle);
        my_dialog.add("statictext", { x: 25, y: 60, width: 100, height: 15 }, "Shutter Phase: ");
        var shutterPhaseInput = my_dialog.add("edittext", { x: 130, y: 58, width: 40, height: 20 }, globalPhase);
        var changeAllInput = my_dialog.add("checkbox", { x: 12, y: 95, width: 200, height: 20 }, " Change all comps in project");

        my_dialog.add("button", { x: 25, y: 130, width: 70, height: 25 }, "OK", { name: "ok" });
        my_dialog.add("button", { x: 105, y: 130, width: 70, height: 25 }, "Cancel", { name: "cancel" });

        my_dialog.center();

        shutterAngleInput.onChange = function () {
            var result = parseInt(this.text, 10);
            if (isNaN(result) || result < 0 || result > 720) {
                this.text = globalAngle;
                alert("Out of Range. Please choose a number between 0 and 720");
            } else {
                globalAngle = result;
                this.text = result;
                globalPhase = Math.round(globalAngle * (-1 / 2));
                shutterPhaseInput.text = globalPhase;
            }
        };

        shutterPhaseInput.onChange = function () {
            var result = parseInt(this.text, 10);
            if (isNaN(result) || result < -360 || result > 360) {
                this.text = globalPhase;
                alert("Out of Range. Please choose a number between -360 and 360");
            } else {
                globalPhase = result;
                this.text = result;
            }
        };

        changeAllInput.onClick = function () {
            changeAll = !changeAll;
        };

        return my_dialog.show() == 1 ? true : false;
    }
})();
