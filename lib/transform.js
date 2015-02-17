'use strict';

var Record = require('./marc/record');

module.exports = function() {
    var callback, chunks, data, options, transformer;
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
    var transformers = {
        iso2709: './transform/stringifier',
        text: './transform/textifier',
        mrk: './transform/textifier'
    };

    var format = options.toFormat || 'iso2709';
    var Transformer = require(transformers[format]);
    transformer = new Transformer(options);
    if (data) {
        process.nextTick(function() {
            var d, _i, _len;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
                d = data[_i];
                transformer.write(d);
            }
            return transformer.end();
        });
    }
    if (callback) {
        chunks = [];
        transformer.on('readable', function() {
            var chunk, _results;
            _results = [];
            while (chunk = transformer.read()) {
                _results.push(chunks.push(chunk));
            }
            return _results;
        });
        transformer.on('error', function(err) {
            return callback(err);
        });
        transformer.on('end', function() {
            return callback(null, chunks.join(''));
        });
    }
    return transformer;
};