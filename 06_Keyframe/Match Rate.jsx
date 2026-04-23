/**
 * @name Match Rate
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Keyframe
 * @description Match linear rate of two selected keyframes to current play head position. Can do multiple properties at once.
 * @label MTCH RATE
 * @changelog New: New script to extend selected keyframes to the current playhead with their current rate
 */

(function addLinearRateKeysAtPlayhead_multi() {
    app.beginUndoGroup("Key At Playhead From Two Keys");

    function isArray(v) {
        return v instanceof Array;
    }

    function lerp(a, b, u) {
        return a + (b - a) * u;
    }

    function lerpValue(valA, valB, u) {
        if (typeof valA === "number") {
            return lerp(valA, valB, u);
        }
        if (isArray(valA) && isArray(valB) && valA.length === valB.length) {
            var out = [];
            for (var i = 0; i < valA.length; i++) {
                out[i] = lerp(valA[i], valB[i], u);
            }
            return out;
        }
        throw new Error("Unsupported value type for this property.");
    }

    function findKeyAtTime(prop, t, tol) {
        for (var i = 1; i <= prop.numKeys; i++) {
            if (Math.abs(prop.keyTime(i) - t) <= tol) {
                return i;
            }
        }
        return -1;
    }

    try {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            throw new Error("Please make sure an active comp is open.");
        }

        var tNow = comp.time;

        var frameDur = comp.frameDuration || 1 / 24;
        var tol = frameDur * 0.5;

        var props = comp.selectedProperties;
        if (!props || props.length === 0) {
            throw new Error("Select two keyframes on one or more properties.");
        }

        var didAny = false;

        for (var p = 0; p < props.length; p++) {
            var prop = props[p];

            if (!prop || !prop.canVaryOverTime || prop.propertyType !== PropertyType.PROPERTY) {
                continue;
            }

            var selKeys = prop.selectedKeys;
            if (!selKeys || selKeys.length !== 2) {
                // Not a target property (either 0,1,3+ keys selected) — just skip
                continue;
            }

            var k1 = selKeys[0],
                k2 = selKeys[1];
            if (k1 === k2) {
                continue;
            }

            var t1 = prop.keyTime(k1),
                t2 = prop.keyTime(k2);
            if (t1 === t2) {
                continue;
            }

            var v1 = prop.keyValue(k1),
                v2 = prop.keyValue(k2);

            var tA, tB, vA, vB;
            if (t1 < t2) {
                tA = t1;
                vA = v1;
                tB = t2;
                vB = v2;
            } else {
                tA = t2;
                vA = v2;
                tB = t1;
                vB = v1;
            }

            var u = (tNow - tA) / (tB - tA);

            var newVal = lerpValue(vA, vB, u);

            var existingKey = findKeyAtTime(prop, tNow, tol);
            if (existingKey !== -1) {
                prop.setValueAtKey(existingKey, newVal);
            } else {
                prop.setValueAtTime(tNow, newVal);
            }

            didAny = true;
        }

        if (!didAny) {
            throw new Error("No properties found with exactly TWO selected keyframes.\n\nTip: Select 2 keys on each property you want to extend (e.g. Position + Scale).");
        }
    } catch (err) {
        alert(err.toString());
    } finally {
        app.endUndoGroup();
    }
})();
