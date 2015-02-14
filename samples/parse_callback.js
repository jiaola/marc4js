'use strict';

// require should
// npm install should -g

// run this in the marc4js directory
// node samples/parse_callback.js

var marc4js = require('marc4js');
var fs = require('fs');
var should = require('should');

fs.readFile('samples/PGA-other-2.mrc', function(err, data) {
    marc4js.parse(data, {}, function(err, records) {
        records.length.should.eql(159);
    });
});
