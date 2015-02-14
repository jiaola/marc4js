'use strict';

// require should
// npm install should -g

// run this in the marc4js directory
// node samples/stringify_stream.js

var marc4js = require('marc4js');

var stringifier = marc4js.stringify();
var output = '';
stringifier.on('data', function(chunk) {
    output += chunk
});
stringifier.on('error', function(err) {
    console.log(err.message);
});
stringifier.on('end', function() {
    console.log(output);
});
var records = [];
// build records ...
records.forEach(function(record) {
    stringifier.write(record);
});
stringifier.end();