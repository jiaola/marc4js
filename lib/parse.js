'use strict';

module.exports = function() {
    var callback, called, records, data, options, parser;
    if (arguments.length === 3) {
        data = arguments[0];
        options = arguments[1];
        callback = arguments[2];
    } else if (arguments.length === 2) {
        if (typeof arguments[0] === 'string') {
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
        } else {
            options = arguments[0];
        }
    }
    if (options == null) {
        options = {};
    }

    var parsers = {
        iso2709: './parse/Iso2709_parser',
        text: './parse/mrk_parser',
        mrk: './parse/mrk_parser'
    };

    var format = options.fromFormat || 'iso2709';
    var Parser = require(parsers[format]);
    parser = new Parser(options);
    if (data) {
        process.nextTick(function() {
            parser.write(data);
            return parser.end();
        });
    }
    if (callback) {
        called = false;
        records = [];
        //chunks = options.objname ? {} : [];
        parser.on('data', function(record) {
            records.push(record);
            //return _results;
        });
        parser.on('error', function(err) {
            called = true;
            return callback(err);
        });
        parser.on('end', function() {
            if (!called) {
                return callback(null, records);
            }
        });
    }
    return parser;
};

