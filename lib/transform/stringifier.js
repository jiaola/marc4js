'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var Record = require('../marc/record');
var Util = require('../util');

var Stringifier = function (opts) {
    opts = opts || {};
    Transform.call(this, opts);
    opts.objectMode = true;
    this.objectMode = true; //opts.objectMode || false;
    this.encoding = opts.encoding;
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

module.exports = Stringifier;
