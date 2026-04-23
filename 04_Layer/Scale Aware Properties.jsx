/**
 * @name Scale Aware Properties
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Layer
 * @description Adds an expression for known properties that don't scale along with a layer's scale
 * @label SCALE
 */

(function applyScaleAwareExpressions() {
    app.beginUndoGroup("Apply Scale-Aware Expressions");

    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please make an active comp.");
        return;
    }

    var layers = comp.selectedLayers;
    if (!layers || layers.length === 0) {
        alert("Please select one or more layers.");
        return;
    }

    // ------------------------------------------------------------
    // Expression to apply
    // ------------------------------------------------------------
    var expr = "scaleFactor = length(toComp([0,0]), toComp([0.7071,0.7071]));\n" + "value * scaleFactor;";

    // ------------------------------------------------------------
    // Property database
    // ------------------------------------------------------------
    var RULES = [
        // Common first-party effects
        // These use effect-property match names, so the numeric suffix is the parameter slot.
        "ADBE Drop Shadow-0004", // Drop Shadow > Distance
        "ADBE Drop Shadow-0005", // Drop Shadow > Softness

        // Layer Styles > Stroke
        "frameFX/size", // Size

        // Layer Styles > Drop Shadow
        "dropShadow/distance", // Distance
        "dropShadow/chokeMatte", // Spread
        "dropShadow/blur", // Size

        // Layer Styles > Inner Shadow
        "innerShadow/distance", // Distance
        "innerShadow/chokeMatte", // Choke
        "innerShadow/blur", // Size

        // Layer Styles > Outer Glow
        "outerGlow/chokeMatte", // Spread
        "outerGlow/blur", // Size

        // Layer Styles > Inner Glow
        "innerGlow/chokeMatte", // Choke
        "innerGlow/blur", // Size

        // Layer Styles > Bevel and Emboss
        "bevelEmboss/blur", // Size
        "bevelEmboss/softness", // Soften

        // Layer Styles > Satin
        "chromeFX/distance", // Distance
        "chromeFX/blur", // Size

        // Layer Styles > Overlay scales
        "gradientFill/scale", // Gradient Overlay > Scale
        "patternFill/scale" // Pattern Overlay > Scale
    ];

    var appliedCount = 0;
    var matchedProps = [];

    function isProperty(item) {
        return item instanceof Property;
    }

    function isPropertyGroup(item) {
        return item instanceof PropertyGroup || item instanceof MaskPropertyGroup;
    }

    function getPropertyPath(prop) {
        var parts = [];
        var p = prop;
        while (p) {
            try {
                parts.unshift(p.name);
                p = p.parentProperty;
            } catch (err) {
                break;
            }
        }
        return parts;
    }

    function matchesRule(prop) {
        for (var i = 0; i < RULES.length; i++) {
            if (prop.matchName === RULES[i]) {
                return true;
            }
        }
        return false;
    }

    function canApplyToProperty(prop) {
        if (!isProperty(prop)) {
            return false;
        }
        if (!prop.canSetExpression) {
            return false;
        }

        // Only apply to scalar numeric properties
        if (prop.propertyValueType !== PropertyValueType.OneD) {
            return false;
        }

        return true;
    }

    function processGroup(group) {
        var i, child, path, isMatch;

        for (i = 1; i <= group.numProperties; i++) {
            child = group.property(i);
            if (!child) {
                continue;
            }

            if (isPropertyGroup(child)) {
                processGroup(child);
            } else if (isProperty(child)) {
                isMatch = matchesRule(child);

                if (isMatch) {
                    if (canApplyToProperty(child)) {
                        try {
                            path = getPropertyPath(child);
                            child.expression = expr;
                            appliedCount++;
                            matchedProps.push(path.join(" / "));
                        } catch (e) {}
                    }
                }
            }
        }
    }

    for (var l = 0; l < layers.length; l++) {
        processGroup(layers[l]);
    }

    var msg = "Done.\n\nApplied: " + appliedCount;

    if (matchedProps.length > 0) {
        msg += "\n\nMatched properties:\n- " + matchedProps.join("\n- ");
    }

    alert(msg);

    app.endUndoGroup();
})();
