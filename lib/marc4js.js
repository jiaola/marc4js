exports.marc = {
    Record: require('./marc/record'),
    DataField: require('./marc/data_field')
};

exports = {
    parse: require('./parse'),
    stringify: require('./stringify')
};

exports.converter = {};

exports.MarcError = require('./marc_error');
