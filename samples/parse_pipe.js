'use strict';

// require should
// npm install should -g

// run this in the marc4js directory
// node samples/parse_pipe.js

var marc4js = require('marc4js');
var fs = require('fs');
var should = require('should');

var parser = marc4js.parse();
var stringifier = marc4js.stringify();

fs.createReadStream('samples/PGA-other-2.mrc').pipe(parser).pipe(stringifier).pipe(process.stdout);
