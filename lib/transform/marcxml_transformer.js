'use strict';

var Transform = require('stream').Transform;
var util = require('util');
var Record = require('../marc/record');
var Util = require('../util');
var builder = require('xmlbuilder');

var MarcxmlTransformer = function (opts) {
    opts = opts || {};
    Transform.call(this, opts);
    opts.objectMode = true;
    this.objectMode = true; //opts.objectMode || false;
    this.encoding = opts.encoding;
    this.starting = true;
    this.pretty = opts.pretty || true;
    this.indent = opts.indent || '  ';
    this.newline = opts.newline || '\n';
};

util.inherits(MarcxmlTransformer, Transform);

MarcxmlTransformer.prototype._transform = function (record, encoding, callback) {
    this.push(record);
    return callback();
};

MarcxmlTransformer.prototype.write = function(record, encoding, callback) {
    var header = '';
    if (this.starting) {
        this.starting = false;
        header = '<?xml version="1.0" encoding="UTF-8"?>' + this.newline +
            '<collection xmlns="http://www.loc.gov/MARC21/slim">';
        if (this.pretty) {
            header += this.newline;
        }

    }
    var root = builder.create('record');
    root.ele('leader', record.leader.marshal());
    record.controlFields.forEach(function(field) {
        root.ele('controlfield', {'tag': field.tag}, field.data);
    });
    record.dataFields.forEach(function(field) {
        var ele = root.ele('datafield', {'tag': field.tag, 'ind1': field.indicator1, 'ind2': field.indicator2});
        field.subfields.forEach(function(subfield) {
            ele.ele('subfield', {'code': subfield.code}, subfield.data);
        });
    });
    var xmlstr = root.toString({pretty: this.pretty, indent: this.indent, offset: 1, newline: this.newline});
    return Transform.prototype.write.call(this, header + xmlstr, encoding, callback);
};

MarcxmlTransformer.prototype._flush = function(callback) {
    this.push("</collection>");
    return callback();
};

module.exports = MarcxmlTransformer;
