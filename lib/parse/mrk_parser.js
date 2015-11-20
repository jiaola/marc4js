'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var Util = require('../util');
var ControlField = require('../marc/control_field');
var DataField = require('../marc/data_field');
var Subfield = require('../marc/subfield');
var Record = require('../marc/record');
var Leader = require('../marc/leader');

var MrkParser = function (opts) {
    opts = opts || {};
    opts.objectMode = true; // this has to be true. Emit only Record objects

    Transform.call(this, opts);

    this.spaceReplace = opts.spaceReplace || '\\';
    this.lines = [];
};

util.inherits(MrkParser, Transform);

MrkParser.prototype._transform = function (chunk, encoding, callback) {
    if (typeof chunk == 'string' || chunk instanceof String) {
        chunk = new Buffer(chunk, encoding);
    }

    var lines, i;
    lines = (chunk.toString()).split('\n');
    for(i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) {
            continue;
        }
        if (line.substr(1, 3) === 'LDR') {
            if (this.lines.length > 0) {
                var record;
                try {
                    record = this._parse(this.lines);
                } catch (err) {
                    this.emit("error", err);
                }
                this.push(record);
                this.lines = [];
            }
        }
        this.lines.push(line);
    }
    return callback();
};

MrkParser.prototype._flush = function(callback) {
    if (this.lines.length > 0) {
        var record;
        try {
            record = this._parse(this.lines);
        } catch (err) {
            this.emit("error", err);
        }
        this.push(record);
        this.lines = [];
    }
    return callback();
};

MrkParser.prototype._parse = function (lines) {
    var record = new Record();
    var spaceReplace = this.spaceReplace;
    lines.forEach(function(line) {
        var tag = line.substr(1, 3);
        if (tag === 'LDR') {
            record.leader = new Leader(line.substr(6));
        } else {
            var re = new RegExp(spaceReplace.replace('\\', '\\\\'), 'g');
            var field;
            if (Util.isControlField(tag)) {
                field = new ControlField();
                field.data = line.substr(6).replace(re, ' ');
            } else {
                field = new DataField();
                var data = line.substr(6);
                field.indicator1 = data.charAt(0).replace(re, ' ');
                field.indicator2 = data.charAt(1).replace(re, ' ');
                data.substr(3).split('$').forEach(function(sf) {
                    field.addSubfield(new Subfield(sf.charAt(0), sf.substr(1)));
                });
            }
            field.tag = tag;
            record.addVariableField(field);
        }
    });
    return record;
};


module.exports = MrkParser;
