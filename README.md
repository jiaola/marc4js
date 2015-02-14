[![Build Status](https://travis-ci.org/jiaola/marc4js.svg?branch=master)](https://travis-ci.org/jiaola/marc4js)

A Node.js module for handling MARC records

## Installation

```
npm install marc4js

```

## Examples

Examples can be found in the `samples` directory if source code is cloned from github. 

### Parsers

Parsers read different formats into marc4js.marc.Record objects.

#### Parse MARC file

#### `marc4js.parse`
`marc4js.parse` parse a string in MARC format and creates `marc4js.marc.Record` objects.

##### Using the callback API

The parser receive a string/buffer and return am array of `marc4js.marc.Record` objects
inside a user-provided callback. This example is available with the command
`node samples/callback.js`.

```javascript
var marc4js = require('marc4js');
var fs = require('fs');
var should = require('should');

fs.readFile('samples/PGA-other-2.mrc', function(err, data) {
    marc4js.parse(data, {}, function(err, records) {
        records.length.should.eql(159);
    });
});
```

##### Using the stream API and pipe function

The following example uses the stream API of the parser. Since the parser always emit
objects, therefore it is always in the non-flowing mode - meaning one can only attach
a 'data' event listener, but not a 'readable' event listener. The object passed to
the callback function in the 'data' event listener is a `marc4js.marc.Record` object.

```javascript
'use strict';

// require should
// npm install should -g

// run this in the marc4js directory
// node samples/parse_stream.js

var marc4js = require('marc4js');
var fs = require('fs');
var should = require('should');

var parser = marc4js.parse();
var records = [];
fs.readFile('samples/PGA-other-2.mrc', function(err, data) {
    parser.on('data', function (record) {
        records.push(record);
    });
    parser.on('error', function (error) {
        console.log("error: ", error);
    });
    parser.on('end', function () {
        records.length.should.eql(159);
    });
    parser.write(data.toString());
    parser.end();
});
```

One useful function of the Stream API is pipe to interact between multiple streams.
You may use this function to pipe a stream.Readable string source to a stream.Writable
object destination. This example is available as node samples/parse_pipe.js. It reads a
file, parses its content and then transform it back to MARC string.

```javascript
var marc4js = require('marc4js');
var fs = require('fs');
var should = require('should');

var parser = marc4js.parse();
var stringifier = marc4js.stringify();

var records = [];
parser.on('data', function (record) {
    records.push(record);
});
parser.on('error', function (error) {
    console.log("error: ", error);
});
parser.on('end', function () {
    records.length.should.eql(159);
});

var is = fs.createReadStream('samples/PGA-other-2.mrc');
is.pipe(parser).pipe(stringifier).pipe(process.stdout);
```

This example uses the pipe and the stream API to parse a marc file.

```
var marc4js = require('marc4js');
var fs = require('fs');
var should = require('should');

var parser = marc4js.parse();

var records = [];
parser.on('data', function (record) {
    records.push(record);
});

parser.on('error', function (error) {
    console.log("error: ", error);
});

parser.on('end', function () {
    records.length.should.eql(159);
});

fs.createReadStream('samples/PGA-other-2.mrc').pipe(parser);
```

### Transformers
Transformers transform the marc4js.marc.Record objects into other formats.

#### `marc4js.stringify`

`marc4js.stringify` converts `marc4js.marc.Record` objects into MARC strings.

##### Using the callback API

##### Using the stream API

##### Using the pipe function


