'use strict';

var Subfield = function (code, data) {
    if (typeof code !== 'undefined') this._code = code;
    if (typeof data !== 'undefined') this._data = data;
};

// Define getters and setters
Object.defineProperties(Subfield.prototype, {
    code: {
        get: function () {
            return this._code;
        },
        set: function (val) {
            this._code = val;
        }
    },
    data: {
        get: function () {
            return this._data;
        },
        set: function (val) {
            this._data = val;
        }
    }
});

Subfield.prototype.find = function (pattern) {
    return pattern.test(this._data);
};

Subfield.prototype.toString = function () {
    return "$" + this._code + this._data;
};

Subfield.prototype.marshal = function () {
    return this._code + this._data;
}

module.exports = Subfield;
