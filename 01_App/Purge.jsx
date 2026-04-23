/**
 * @name Purge
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category App
 * @description Purge RAM
 * @label PURGE
 * @shift-click Purge disk cache
 */

(function purge() {
    if (ScriptUI.environment.keyboardState.shiftKey) {
        app.executeCommand(10200);
    } else {
        var answer = Window.confirm("Are you sure you wish to purge RAM?");
        if (answer == true) {
            app.purge(PurgeTarget.ALL_CACHES);
        }
    }
})();
