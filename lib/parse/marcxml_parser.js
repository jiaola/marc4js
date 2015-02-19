'use strict';

var sax = require('sax');
var util = require('util');
var Transform = require('stream').Transform;
var Record = require('../marc/record');
var ControlField = require('../marc/control_field');
var DataField = require('../marc/data_field');
var Subfield = require('../marc/subfield');
var Leader = require('../marc/leader');

function MarcxmlParser (options) {
    if (!(this instanceof MarcxmlParser)) return new MarcxmlParser(options);
    Transform.call(this);
    this._readableState.objectMode = true;
    this._readableState.highWaterMark = 16; // max. # of output nodes buffered

    this.init();
    //this.parseOpts(options);

    var strict = options.strict || false;

    // See https://github.com/isaacs/sax-js for more info
    this.stream = sax.createStream(strict /* strict mode - no by default */, {lowercase: true, xmlns: true });
    this.stream.on('error', this.handleSaxError.bind(this));
    //this.stream.on('processinginstruction', this.handleProcessingInstruction.bind(this));
    this.stream.on('opentag', this.handleOpenTag.bind(this));
    this.stream.on('closetag',this.handleCloseTag.bind(this));
    this.stream.on('text', this.handleText.bind(this));
    this.stream.on('cdata', this.handleText.bind(this));
    this.stream.on('end', this.handleEnd.bind(this));
}
util.inherits(MarcxmlParser, Transform);

MarcxmlParser.prototype.init = function (){
    this.stack = [];
};


MarcxmlParser.prototype.handleEnd = function (){
    // We made it to the end without throwing, but let's make sure we were actually
    // parsing a feed
    if (!(this.meta && this.meta['#type'])) {
        var e = new Error('Not a feed');
        return this.handleError(e);
    }
    this.push(null);
};

MarcxmlParser.prototype.handleSaxError = function (e) {
    this.emit('error', e);
    if (this.options.resume_saxerror) {
        if (this.stream._parser) {
            this.stream._parser.error = null;
            this.stream._parser.resume();
        }
    }
};

MarcxmlParser.prototype.handleError = function (e){
    this.emit('error', e);
};

MarcxmlParser.prototype.handleOpenTag = function (node){
    var obj;
    switch (node.local) {
        case 'record':
            obj = new Record();
            break;
        case 'leader':
            obj = new Leader();
            break;
        case 'controlfield':
            obj = new ControlField();
            if (node.attributes.tag) {
                obj.tag = node.attributes.tag.value;
            } else {
                // TODO: throw an error
            }
            break;
        case 'datafield':
            obj = new DataField();
            if (node.attributes.tag) {
                obj.tag = node.attributes.tag.value;
            } else {
                // TODO: throw an error
            }
            if (node.attributes.ind1) {
                obj.indicator1 = node.attributes.ind1.value;
            } else {
                // TODO: throw an error
            }
            if (node.attributes.ind2) {
                obj.indicator2 = node.attributes.ind2.value;
            } else {
                // TODO: throw an error
            }
            break;
        case 'subfield':
            obj = new Subfield();
            if (node.attributes.code) {
                obj.code = node.attributes.code.value;
            } else {
                // TODO: throw an error
            }
            break;
        default:
            break;
    }
    if (typeof obj !== 'undefined') this.stack.push(obj);
};

MarcxmlParser.prototype.handleCloseTag = function (el){
    var obj = this.stack.pop();
    if (obj instanceof Subfield) {
        var field = this.stack.pop();
        field.addSubfield(obj);
        this.stack.push(field);
    } else if (obj instanceof ControlField || obj instanceof DataField) {
        var record = this.stack.pop();
        record.addVariableField(obj);
        this.stack.push(record);
    } else if (obj instanceof Leader) {
        var record = this.stack.pop();
        record.leader = obj;
        this.stack.push(record);
    } else if (obj instanceof Record) {
        this.push(obj);
    }
};

MarcxmlParser.prototype.handleText = function (text){
    var obj = this.stack.pop();
    if (obj instanceof Subfield || obj instanceof ControlField) {
        obj.data = text;
    } else if (obj instanceof Leader) {
        obj.unmarshal(text);
    }
    this.stack.push(obj);
};

// Naive Stream API
MarcxmlParser.prototype._transform = function (data, encoding, done) {
    try {
        this.stream.write(data);
        done();
    } catch (e) {
        done(e);
        this.push(null); // Manually trigger and end, since we can't reliably do any more parsing
    }
};

module.exports = MarcxmlParser;