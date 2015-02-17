'use strict';

exports.marc = {
    Record: require('./marc/record'),
    DataField: require('./marc/data_field'),
    ControlField: require('./marc/control_field'),
    Leader: require('./marc/leader'),
    Subfield: require('./marc/subfield'),
    VariableField: require('./marc/variable_field')
};

exports.parse = require('./parse');
exports.stringify = require('./transform/stringifier');
exports.MarcError = require('./marc_error');

