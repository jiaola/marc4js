'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var Util = require('./util');
var ControlField = require('./marc/control_field');
var DataField = require('./marc/data_field');
var Subfield = require('./marc/subfield');
var Record = require('./marc/record');
var Leader = require('./marc/leader');

module.exports = function() {
    var callback, called, chunks, data, options, stringifier;
    if (arguments.length === 3) {
        data = arguments[0];
        options = arguments[1];
        callback = arguments[2];
    } else if (arguments.length === 2) {
        if (Array.isArray(arguments[0])) {
            data = arguments[0];
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
    stringifier = new Stringifier(options);
    if (data) {
        process.nextTick(function() {
            var d, _i, _len;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
                d = data[_i];
                stringifier.write(d);
            }
            return stringifier.end();
        });
    }
    if (callback) {
        chunks = [];
        stringifier.on('readable', function() {
            var chunk, _results;
            _results = [];
            while (chunk = stringifier.read()) {
                _results.push(chunks.push(chunk));
            }
            return _results;
        });
        stringifier.on('error', function(err) {
            return callback(err);
        });
        stringifier.on('end', function() {
            return callback(null, chunks.join(''));
        });
    }
    return stringifier;
};

var Stringifier = function (opts) {
    opts = opts || {};
    this.objectMode = opts.objectMode || false;
    this.encoding = opts.encoding;

    Transform.call(this, opts);
};

util.inherits(Stringifier, Transform);

Stringifier.prototype._transform = function (record, encoding, callback) {
    this.push(record);
    return callback();
};

Stringifier.prototype.write = function(chunk, encoding, callback) {
    var record = chunk;
    try {
        if (typeof this.encoding !== 'undefined') {
            record.leader.charCodingScheme = Util.encodingToCode(this.encoding);
        } else {
            if (typeof encoding === 'undefined') {
                record.leader.charCodingScheme = Util.encodingToCode('utf-8');
            } else {
                record.leader.charCodingScheme = Util.encodingToCode(encoding);
            }
        }
        chunk = record.marshal();
    } catch (err) {
        callback(err);
    }
    return Transform.prototype.write.call(this, chunk, encoding, callback);
};

module.exports.Stringifier = Stringifier;
