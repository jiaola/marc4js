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
        iso2709: './parse/iso2709_parser',
        marc: './parse/iso2709_parser',
        text: './parse/mrk_parser',
        mrk: './parse/mrk_parser',
        marcxml: './parse/marcxml_parser',
        xml: './parse/marcxml_parser',
        json: './parse/mij_parser',
        mij: './parse/mij_parser'
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

        var handleData = function(record) {
            records.push(record);
        };
        parser.on('data', handleData);
        parser.once('error', function(err) {
            called = true;
            parser.removeListener('data', handleData);
            return callback(err);
        });
        parser.once('end', function() {
            if (!called) {
                parser.removeListener('data', handleData);
                return callback(null, records);
            }
        }.bind(parser));
    }
    return parser;
};
