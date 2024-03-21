import VariableField from "./variable_field.js";
import Subfield from "./subfield.js";
import MarcError from "../marc_error.js";

var DataField = function (tag, ind1, ind2, subfields) {
    if (typeof tag !== "undefined") this._tag = tag;
    if (typeof ind1 !== "undefined") this._indicator1 = ind1;
    if (typeof ind2 !== "undefined") this._indicator2 = ind2;
    if (typeof subfields !== "undefined") {
        this._subfields = subfields.map(function (f) {
            return new Subfield(f[0], f[1]);
        });
    } else {
        this._subfields = [];
    }
};
DataField.prototype = Object.create(VariableField.prototype);

// Define getters and setters
Object.defineProperties(DataField.prototype, {
    indicator1: {
        get: function () {
            return this._indicator1;
        },
        set: function (val) {
            this._indicator1 = val;
        },
    },
    indicator2: {
        get: function () {
            return this._indicator2;
        },
        set: function (val) {
            this._indicator2 = val;
        },
    },
    subfields: {
        get: function () {
            return this._subfields;
        },
        set: function (val) {
            this._subfields = val;
        },
    },
});

DataField.prototype.unmarshal = function (data) {
    this.indicator1 = data.charAt(0);
    this.indicator2 = data.charAt(1);
    this.subfields = data
        .substr(3)
        .split("\x1f")
        .map(function (sf) {
            var code = sf.substr(0, 1);
            if (code < 0) throw new MarcError("unexpected end of data field");
            var subfield = new Subfield();
            subfield.code = code;
            subfield.data = sf.substr(1);
            return subfield;
        });
};

DataField.prototype.addSubfield = function (subfield) {
    this.subfields.push(subfield);
};

DataField.prototype.removeSubfield = function (subfield) {
    if (this.subfields.indexOf(subfield) != -1) {
        this.subfields.splice(this.subfields.indexOf(subfield), 1);
    }
};

DataField.prototype.findSubfields = function (code) {
    return this.subfields.filter(function (el) {
        return el.code == code;
    });
};

DataField.prototype.findSubfield = function (code) {
    return this.findSubfields(code)[0];
};

DataField.prototype.find = function (pattern) {
    return this.subfields.some(function (subfield) {
        return subfield.find(pattern);
    });
};

DataField.prototype.marshal = function () {
    var str = this.indicator1 + this.indicator2;
    this.subfields.forEach(function (subfield, index, array) {
        str = str + "\x1f" + subfield.marshal();
    });
    return str;
};

DataField.prototype.toString = function () {
    return this.marshal();
};

export default DataField;
