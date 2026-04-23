/**
 * @name Parent
 * @version 1.0.0
 * @author Jordan Steele
 * @destination script
 * @category Expression
 * @description Adds a parent expression to selected property with an intensity slider
 * @label PARENT
 */

(function parent() {
    var comp = app.project.activeItem;
    if (comp == null) {
        alert("Please select an active comp");
        return;
    }
    app.beginUndoGroup("Add Parent Expression");
    {
        var propertyTest = comp.selectedProperties[0];
        if (propertyTest instanceof Property) {
            for (var j = 0; j < comp.selectedLayers.length; j++) {
                var layer = comp.selectedLayers[j];
                for (var i = 0; i < layer.selectedProperties.length; i++) {
                    var property = layer.selectedProperties[i];
                    var fx = layer.Effects.addProperty("ADBE Layer Control");
                    fx.name = property.name + " Parent Layer";
                    var fx2 = layer.Effects.addProperty("ADBE Slider Control");
                    fx2.name = property.name + " Parent Intensity";
                    fx2.property(String("ADBE Slider Control-0001")).setValue([1]);
                    fx2.property(String("ADBE Slider Control-0001")).expression = 'if(value=="0"){value=.001;}else{clamp(value, min=-1, max=10)}';
                    var parentExpression =
                        'myParent = effect("' +
                        property.name +
                        ' Parent Layer")("Layer"); myProp = myParent.transform.' +
                        property.name.toLowerCase() +
                        '; Intensity = effect("' +
                        property.name +
                        ' Parent Intensity")("Slider"); (value + (myProp.value - myProp.valueAtTime(0)))/Intensity;';
                    property.expression = parentExpression;
                }
            }
        } else {
            alert("Please select a property to apply the Parent Expression to. \n\nCurrently only works for native transform properties, not effect properties.");
        }
    }
})();
