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
        iso2709: './transform/iso2709_transformer',
        marc: './transform/iso2709_transformer',
        text: './transform/mrk_transformer',
        mrk: './transform/mrk_transformer',
        xml: './transform/marcxml_transformer',
        marcxml: './transform/marcxml_transformer',
        json: './transform/mij_transformer',
        mij: './transform/mij_transformer'
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
        var handleReadable = function() {
            var chunk, _results;
            _results = [];
            while (chunk = transformer.read()) {
                _results.push(chunks.push(chunk));
            }
            return _results;
        };
        transformer.on('readable', handleReadable);
        transformer.once('error', function(err) {
            transformer.removeListener('readable', handleReadable);
            return callback(err);
        });
        transformer.once('end', function() {
            transformer.removeListener('readable', handleReadable);
            return callback(null, chunks.join(''));
        });
    }
    return transformer;
};