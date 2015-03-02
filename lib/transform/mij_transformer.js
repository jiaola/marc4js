'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var Record = require('../marc/record');
var Util = require('../util');

var MijTransformer = function (opts) {
    if (!(this instanceof MijTransformer)) return new MijTransformer(options);

    opts = opts || {};
    Transform.call(this, opts);

    this.encoding = opts.encoding;
    this.pretty = opts.pretty || true;
    this.indent = opts.indent || '  ';
    this.asArray = opts.asArray || true;

    this.starting = true;
};

util.inherits(MijTransformer, Transform);

MijTransformer.prototype._transform = function (record, encoding, callback) {
    this.push(record);
    return callback();
};

MijTransformer.prototype.write = function(record, encoding, callback) {
    var header = '';
    if (this.starting) {
        this.starting = false;
        if (this.asArray) {
            header = '[';
        }
    } else {
        header = ',';
    }
    var str = header;
    str += '{"leader":"' + record.leader.marshal() + '",';
    str += '"fields":';
    str += '[';
    var cfs = record.controlFields.map(function(field) {
        return '{"' + field.tag + '":"' + field.data + '"}';
    });
    str += cfs.join(',');
    var dfs = record.dataFields.map(function(field) {
        var sfs = field.subfields.map(function(subfield) {
            return '{"' + subfield.code + '":"' + subfield.data + '"}';
        });
        return '{"' + field.tag + '":{"subfields":[' + sfs.join(',') + '],"ind1":"'
            + field.indicator1 + '","ind2":"' + field.indicator2 + '"}}';
    });
    if (dfs.length > 0) {
        str += ','
    }
    str += dfs.join(',');
    str += ']}';
    return Transform.prototype.write.call(this, str, encoding, callback);
};

MijTransformer.prototype._flush = function(callback) {
    if (this.asArray) this.push(']');
    return callback();
};

module.exports = MijTransformer;
