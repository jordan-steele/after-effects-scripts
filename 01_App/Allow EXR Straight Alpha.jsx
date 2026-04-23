/**
 * @name Allow EXR Straight Alpha
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category App
 * @description Allow After Effects to render EXR with a straight alpha channel. This changes an AE preference setting and needs an AE restart to take effect after it's run.
 * @label STRAIGHT
 */

(function allowEXRStraightAlpha() {
    var section = "Misc Section";
    var pref = "Allow writing straight alpha into EXR";
    var type = PREFType.PREF_Type_MACHINE_INDEPENDENT;

    if (app.preferences.havePref(section, pref, type)) {
        if (app.preferences.getPrefAsBool(section, pref, type)) {
            alert("EXR straight alpha pref already set to TRUE. No need to set again");
        } else {
            alert("EXR straight alpha pref was set to FALSE. Setting to TRUE. Please restart After Effects.");
            app.preferences.savePrefAsBool(section, pref, true, type);
        }
    } else {
        alert("EXR straight alpha pref not set. Setting to TRUE. Please restart After Effects.");
        app.preferences.savePrefAsBool(section, pref, true, type);
    }
})();
