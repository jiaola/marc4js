'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var MarcError = require('../marc_error');
var Util = require('../util');
var ControlField = require('../marc/control_field');
var DataField = require('../marc/data_field');
var Record = require('../marc/record');
var Leader = require('../marc/leader');
var Subfield = require('../marc/subfield');

var Iso2709Parser = function (opts) {
    opts = opts || {};
    opts.objectMode = true; // this has to be true. Emit only Record objects
    this.forceMARC8 = opts.forceMARC8;
    if (typeof this.forceMARC8 === 'undefined') {
        this.forceMARC8 = false;
    }
    this.marc8converter = opts.marc8converter;

    // default encoding is utf8. if the marc file has marc8,
    // please use 'binary' encoding
    this.encoding = opts.encoding || 'utf8';

    Transform.call(this, opts);

    this.prevChunk = null;
};

util.inherits(Iso2709Parser, Transform);

Iso2709Parser.prototype._transform = function (chunk, encoding, callback) {
    if (typeof chunk == 'string' || chunk instanceof String) {
        chunk = new Buffer(chunk, 'binary');
    } else {
        encoding = undefined;
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
                    record = this._parse(raw, encoding);
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

Iso2709Parser.prototype._parse = function(data, encoding) {
    var record = new Record();
    var leader = new Leader();
    leader.unmarshal(data.toString(this.encoding, 0, 24));
    record.leader = leader;

    var g0, g1;

    var directoryLength = leader.baseAddressOfData - (24 + 1);
    if ((directoryLength % 12) !== 0) {
        throw new MarcError("invalid directory");
    }
    var size = directoryLength / 12;

    var pos = directoryLength + 25;
    for (var i = 0; i < size; i++) {
        var offset = 24 + i * 12;
        var tag = data.toString(this.encoding, offset, offset+3);

        var field;
        if (Util.isControlField(tag)) {
            field = new ControlField();
            var chars = [];
            while (data[pos] !== 0x1e) {
                chars.push(data[pos++]);
            }
            pos++;
            field.data = this._convert(record.leader.charCodingScheme, chars, {G0: g0, G1: g1});
        } else {
            // field = this._parseDataField();
            field = new DataField();
            field.indicator1 = String.fromCharCode(data[pos++]);
            field.indicator2 = String.fromCharCode(data[pos++]);

            while (data[pos] !== 0x1e) {
                if (data[pos++] !== 0x1f) {
                    throw new MarcError("Subfield doesn't start with 0x1f");
                } // skip 0x1f
                var subfield = new Subfield();
                subfield.code = String.fromCharCode(data[pos++]);
                var chars = [];
                while (data[pos] !== 0x1f && data[pos] !== 0x1e) {
                    chars.push(data[pos++]);
                }
                subfield.data = this._convert(record.leader.charCodingScheme, chars, {G0: g0, G1: g1});
                field.addSubfield(subfield);
            }
            pos++;
        }

        field.tag = tag;
        record.addVariableField(field);

        if (field.tag === '066') {
            var g0g1 = this._charset(field);
            g0 = g0g1[0];
            g1 = g0g1[1];
        }
    }
    return record;
};

Iso2709Parser.prototype._convert = function(charCodingScheme, data, opts) {
    var value;
    if (charCodingScheme === 'a') {
        value = new Buffer(data).toString('utf8');
    } else if (charCodingScheme === ' ') {
        if (this.marc8converter) {
            value = this.marc8converter(data, opts);
        } else {
            value = new Buffer(data).toString(this.encoding);
        }
    } else {
        throw new MarcError("Unexpected character coding scheme. " +
        "It has to be 'a' or ' ' but value is '" + charCodingScheme + "'");
    }
    return value;
};

Iso2709Parser.prototype._charset = function(f066) {
    var subfields = f066.subfields;
    var g0, g1;
    var G0_SET = [0x28, 0x2c, 0x24]; // ['(', ',', '$'];
    var G1_SET = [0x29, 0x2d, 0x24]; // [')', '-', '$'];
    for (var i = 0; i < subfields.length; i++) {
        var subfield = subfields[i];
        switch (subfield.code) {
            case 'a':
                g0 = subfield.data.charCodeAt(1);
                break;
            case 'b':
                g1 = subfield.data.charCodeAt(1);
                break;
            case 'c':
                var c1 = subfield.data.charCodeAt(0);
                if (G0_SET.indexOf(c1) >= 0) {
                    g0 = subfield.data.charCodeAt(1);
                }
                if (G1_SET.indexOf(c1) >= 0) {
                    g1 = subfield.data.charCodeAt(1);
                }
                break;
        }
    }
    return [g0, g1];
}

module.exports = Iso2709Parser;
