'use strict';

var VariableField = function () {
};

// Define getters and setters
Object.defineProperties(VariableField.prototype, {
    tag: {
        get: function () {
            return this._tag;
        },
        set: function (val) {
            this._tag = val;
        }
    }
});

module.exports = VariableField;
