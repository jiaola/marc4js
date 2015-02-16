'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var os = require('os');
var Util = require('./util');
var Record = require('./marc/record');
var Leader = require('./marc/leader');
var ControlField = require('./marc/control_field');
var DataField = require('./marc/data_field');
var Subfield = require('./marc/subfield');

module.exports = function() {
    var callback, chunks, data, options, textifier;
    if (arguments.length === 3) {
        if (Array.isArray(arguments[0])) {
            data = arguments[0];
        } else {
            data = [arguments[0]];
        }
        options = arguments[1];
        callback = arguments[2];
    } else if (arguments.length === 2) {
        if (Array.isArray(arguments[0])) {
            data = arguments[0];
        } else if (arguments[0] instanceof Record) {
            data = [arguments[0]];
        } else {
            options = arguments[0];
        }
        if (typeof arguments[1] === 'function') {
            callback = arguments[1];
        } else {
            options = arguments[1];
        }
    } else if (arguments.length === 1) {
        if (typeof arguments[0] === 'function') {
            callback = arguments[0];
        } else if (Array.isArray(arguments[0])) {
            data = arguments[0];
        } else {
            options = arguments[0];
        }
    }
    if (options == null) {
        options = {};
    }
    textifier = new Textifier(options);
    if (data) {
        process.nextTick(function() {
            var d, _i, _len;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
                d = data[_i];
                textifier.write(d);
            }
            return textifier.end();
        });
    }
    if (callback) {
        chunks = [];
        textifier.on('readable', function() {
            var chunk, _results;
            _results = [];
            while (chunk = textifier.read()) {
                _results.push(chunks.push(chunk));
            }
            return _results;
        });
        textifier.on('error', function(err) {
            return callback(err);
        });
        textifier.on('end', function() {
            return callback(null, chunks.join(''));
        });
    }
    return textifier;
};

var Textifier = function (opts) {
    opts = opts || {};
    this.objectMode = opts.objectMode || false;
    this.encoding = opts.encoding || 'utf8';
    this.spaceReplace = opts.spaceReplace || '\\';

    Transform.call(this, opts);
};

util.inherits(Textifier, Transform);

Textifier.prototype._transform = function (record, encoding, callback) {
    this.push(record);
    return callback();
};

Textifier.prototype.write = function(chunk, encoding, callback) {
    var record = chunk;
    var buffers = [];
    if (typeof encoding === 'undefined') {
        encoding = this.encoding;
    }
    try {
        buffers.push(new Buffer("=LDR  ", encoding));
        buffers.push(new Buffer(record.leader.marshal(), encoding));
        buffers.push(new Buffer(os.EOL, encoding));

        var spaceReplace = this.spaceReplace;

        // write directory
        record.variableFields.forEach(function (field) {
            buffers.push(new Buffer("=" + field.tag + "  ", encoding));
            if (field instanceof ControlField) {
                buffers.push(new Buffer(field.data.replace(/ /g, spaceReplace), encoding));
                buffers.push(new Buffer(os.EOL));
            } else {
                buffers.push(new Buffer(field.indicator1.replace(' ', spaceReplace), encoding));
                buffers.push(new Buffer(field.indicator2.replace(' ', spaceReplace), encoding));
                field.subfields.forEach(function (subfield) {
                    buffers.push(new Buffer("$" + subfield.code, encoding));
                    buffers.push(new Buffer(subfield.data, encoding));
                });
                buffers.push(new Buffer(os.EOL));
            }
        });

        buffers.push(new Buffer(os.EOL));
        chunk = Buffer.concat(buffers);
    } catch (err) {
        callback(err);
    }
    return Transform.prototype.write.call(this, chunk, encoding, callback);
};

module.exports.Textifier = Textifier;
