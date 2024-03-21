import VariableField from "./variable_field.js";

var ControlField = function (tag, data) {
    if (typeof tag !== "undefined") this._tag = tag;
    if (typeof data !== "undefined") this._data = data;
};
ControlField.prototype = Object.create(VariableField.prototype);

// Define getters and setters
Object.defineProperties(ControlField.prototype, {
    data: {
        get: function () {
            return this._data;
        },
        set: function (val) {
            this._data = val;
        },
    },
});

ControlField.prototype.marshal = function () {
    return this.data;
};

ControlField.prototype.toString = function () {
    return this.marshal();
};

export default ControlField;
