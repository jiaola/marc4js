'use strict';

var Util = require('../util.js');

var Record = function () {
    this._controlFields = [];
    this._dataFields = [];
};

// Define getters and setters
Object.defineProperties(Record.prototype, {
    leader: {
        get: function () {
            return this._leader;
        },
        set: function (val) {
            this._leader = val;
        }
    },
    controlFields: {
        get: function () {
            return this._controlFields;
        },
        set: function (val) {
            this._controlFields = val;
        }
    },
    dataFields: {
        get: function () {
            return this._dataFields;
        },
        set: function (val) {
            this._dataFields = val;
        }
    },
    type: {
        get: function () {
            return this._type;
        },
        set: function (val) {
            this._type = val;
        }
    },
    variableFields: {
        get: function () {
            return this.controlFields.concat(this.dataFields);
        }
    }
});

Record.prototype.addVariableField = function (field) {
    if (Util.isControlField(field.tag)) {
        this.controlFields.push(field);
    } else {
        this.dataFields.push(field);
    }
};

Record.prototype.marshal = function () {
    var buffers = [];
    var encoding = Util.codeToEncoding(this.leader.charCodingScheme);

    buffers.push(new Buffer(this.leader.marshal(), encoding));

    var directory = [];
    var fields = [];
    var start = 0;

    // write directory
    this.variableFields.forEach(function (field) {
        var chunk = field.marshal();
        chunk = chunk + '\x1e';

        var len = Buffer.byteLength(chunk, encoding);
        fields.push(new Buffer(chunk, encoding));
        directory.push(new Buffer(field.tag, encoding));
        directory.push(new Buffer(Util.formatInteger(len, 4), encoding));
        directory.push(new Buffer(Util.formatInteger(start, 5), encoding));
        start += len;
    });

    buffers = buffers.concat(directory);
    buffers = buffers.concat(new Buffer('\x1e'));
    buffers = buffers.concat(fields);
    buffers.push(new Buffer('\x1d'));
    return Buffer.concat(buffers);
    return bf;
};

module.exports = Record;
