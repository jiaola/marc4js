[![Build Status](https://travis-ci.org/jiaola/marc4js.svg?branch=master)](https://travis-ci.org/jiaola/marc4js)

A Node.js module for handling MARC records

## Installation

```
npm install marc4js

```

## Examples

Examples can be found in the `samples` directory if source code is cloned from github.

### Parsers

Parsers read different formats into `marc4js.marc.Record` objects.

#### Parse MARC file

#### `marc4js.parse`
`marc4js.parse` parse a string/Buffer in MARC format and creates `marc4js.marc.Record` objects.

##### Using the callback API

The parser receive a string/Buffer and return am array of `marc4js.marc.Record` objects
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
objects, it always uses the non-flowing mode - one can only attach
a 'data' event listener, but not a 'readable' event listener. The object passed to
the callback function in the 'data' event listener is a `marc4js.marc.Record` object.

```javascript
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
object destination. This example is available as `node samples/parse_pipe.js`. It reads a
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

```javascript
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

The following example uses the callback API. The API can convert a single record
or an array of records into a string in MARC format. The following code snippet is
part of the example code. For the full version, see `samples/parse_pipe.js`.

```javascript
var marc4js = require('marc4js');

// build a record from scratch
var record = new marc4js.marc.Record();
// build the record ...

// converts a single record
marc4js.stringify(record, {}, function(err, data) {
    console.log(data);
});

// build an array of records
var records = [];
records.push(record);
var record2 = new marc4js.marc.Record();
// build the record ...
records.push(record2);

// converts an array of records
marc4js.stringify(records, {}, function(err, data) {
    console.log(data);
});
```

##### Using the stream API

Same as `marc4js.parse`, `marc4js.stringify` also provice usage through the stream API.
Complete version of code is in `samples/stringify_stream`

```javascript
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
```

As shown in the parser examples, stringifier and other transformers can be used
in a pipe that is in the down stream of a parser pipe. For details see the example
 `samples/parser_pipe.js`



