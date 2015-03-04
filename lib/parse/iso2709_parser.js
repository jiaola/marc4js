'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var MarcError = require('../marc_error');
var Util = require('../util');
var ControlField = require('../marc/control_field');
var DataField = require('../marc/data_field');
var Record = require('../marc/record');
var Leader = require('../marc/leader');

var Iso2709Parser = function (opts) {
    opts = opts || {};
    opts.objectMode = true; // this has to be true. Emit only Record objects

    Transform.call(this, opts);

    this.prevChunk = null;
};

util.inherits(Iso2709Parser, Transform);

Iso2709Parser.prototype._transform = function (chunk, encoding, callback) {
    if (typeof chunk == 'string' || chunk instanceof String) {
        chunk = new Buffer(chunk, encoding);
    }
    var err;
    try {
        var start = 0;
        var position = 0;
        if (chunk.length === 0) return;
        while (position <= chunk.length) {
            while (position <= chunk.length && chunk[position] !== 29) {
                position++;
            }
            if (position <= chunk.length) {
                var raw;
                if (this.prevChunk === null) {
                    raw = new Buffer(position - start + 1);
                    chunk.copy(raw, 0, start, position);
                } else {
                    raw = new Buffer(this.prevChunk.length + position + 1);
                    this.prevChunk.copy(raw);
                    chunk.copy(raw, this.prevChunk.length, 0, position);
                    this.prevChunk = null;
                }

                var record;
                try {
                    record = this._parse(raw);
                } catch (err) {
                    this.emit("error", err);
                }

                this.push(record);
                position++;
                start = position;
            }
        }
        if (position !== chunk.length) {
            this.prevChunk = chunk.slice(start);
        } else {
            this.prevChunk = null;
        }
        return callback();
    } catch (_error) {
        err = _error;
        return this.emit('error', err);
    }
};

Iso2709Parser.prototype._parse = function (data) {
    var record = new Record();
    var leader = new Leader();
    leader.unmarshal(data.toString('utf8', 0, 24));
    record.leader = leader;

    var encoding = Util.codeToEncoding(leader.charCodingScheme);

    var directoryLength = leader.baseAddressOfData - (24 + 1);
    if ((directoryLength % 12) != 0) {
        throw new MarcError("invalid directory");
    }

    var size = directoryLength / 12;

    for (var i = 0; i < size; i++) {
        var offset = 24 + i * 12;
        var tag = data.toString('utf8', offset, offset + 3);
        var len = parseInt(data.toString('utf8', offset + 3, offset + 7), 0) - 1;
        var pos = parseInt(data.toString('utf8', offset + 7, offset + 12), 0) + 25 + directoryLength;
        var value = data.toString(encoding, pos, pos + len);

        if (data.toString('utf8', pos + len, pos + len + 1) != '\x1e') {
            throw new MarcError("expected field terminator at end of field");
        }

        var field;
        if (Util.isControlField(tag)) {
            field = new ControlField();
            field.data = value;
        } else {
            field = new DataField();
            field.unmarshal(value);
        }
        field.tag = tag;
        record.addVariableField(field);
    }
    return record;
};


module.exports = Iso2709Parser;
