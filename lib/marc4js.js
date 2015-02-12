'use strict';

exports.marc = {
    Record: require('./marc/record'),
    DataField: require('./marc/data_field')
};

exports.parse = require('./parse');
exports.stringify = require('./stringify');
exports.MarcError = require('./marc_error');

