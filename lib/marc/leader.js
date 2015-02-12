'use strict';

var Util = require("../util");

var Leader = function (str) {
    if (typeof str !== 'undefined') {
        this.unmarshal(str);
    }
};

// Define getters and setters
Object.defineProperties(Leader.prototype, {
    id: {
        get: function () {
            return this._id;
        },
        set: function (val) {
            this._id = val;
        }
    },
    recordLength: {
        get: function () {
            return this._recordLength;
        },
        set: function (val) {
            this._recordLength = val;
        }
    },
    recordStatus: {
        get: function () {
            return this._recordStatus;
        },
        set: function (val) {
            this._recordStatus = val;
        }
    },
    typeOfRecord: {
        get: function () {
            return this._typeOfRecord;
        },
        set: function (val) {
            this._typeOfRecord = val;
        }
    },
    implDefined1: {
        get: function () {
            return this._implDefined1;
        },
        set: function (val) {
            this._implDefined1 = val;
        }
    },
    implDefined2: {
        get: function () {
            return this._implDefined2;
        },
        set: function (val) {
            this._implDefined2 = val;
        }
    },
    charCodingScheme: {
        get: function () {
            return this._charCodingScheme;
        },
        set: function (val) {
            this._charCodingScheme = val;
        }
    },
    indicatorCount: {
        get: function () {
            return this._indicatorCount;
        },
        set: function (val) {
            this._indicatorCount = val;
        }
    },
    subfieldCodeLength: {
        get: function () {
            return this._subfieldCodeLength;
        },
        set: function (val) {
            this._subfieldCodeLength = val;
        }
    },
    baseAddressOfData: {
        get: function () {
            return this._baseAddressOfData;
        },
        set: function (val) {
            this._baseAddressOfData = val;
        }
    },
    entryMap: {
        get: function () {
            return this._entryMap;
        },
        set: function (val) {
            this._entryMap = val;
        }
    }
});

Leader.prototype.unmarshal = function (ldr) {
    var s = ldr.substring(0, 5);
    if (Util.isInt(s)) {
        this.recordLength = parseInt(s);
    } else {
        this.recordLength = 0;
    }
    this.recordStatus = ldr.charAt(5);
    this.typeOfRecord = ldr.charAt(6);
    this.implDefined1 = ldr.substring(7, 9);
    this.charCodingScheme = ldr.charAt(9);

    s = ldr.charAt(10);
    if (Util.isInt(s)) {
        this.indicatorCount = parseInt(s);
    } else {
        this.indicatorCount = 2;
    }

    s = ldr.charAt(11);
    if (Util.isInt(s)) {
        this.subfieldCodeLength = parseInt(s);
    } else {
        this.subfieldCodeLength = 2;
    }

    s = ldr.substring(12, 17);
    if (Util.isInt(s)) {
        this.baseAddressOfData = parseInt(s);
    } else {
        this.baseAddressOfData = 0;
    }

    this.implDefined2 = ldr.substring(17, 20);
    this.entryMap = ldr.substring(20, 24);
};

Leader.prototype.marshal = function () {
    return Util.formatInteger(this.recordLength, 5) +
        this.recordStatus + this.typeOfRecord + this.implDefined1 +
        this.charCodingScheme + this.indicatorCount + this.subfieldCodeLength +
        Util.formatInteger(this.baseAddressOfData, 5) + this.implDefined2 + this.entryMap;
};

Leader.prototype.toString = function () {
    return this.marshal();
};


module.exports = Leader;
