[![Build Status](https://travis-ci.org/jiaola/marc4js.svg?branch=master)](https://travis-ci.org/jiaola/marc4js)

A Node.js module for handling MARC records

## Installation

```
npm install marc4js
```

## Features

In the current release (version 0.0.4), marc4js provides the following features

* An easy to use API that can handle large record sets.
* Uses Node.js stream API and pipe functions for parsing and writing ISO2709 format, MarcEdit text (mrk) format and MARCXML.
* Offers callback functions for parsing and writing various formats.
* SAX based MARCXLM parsing that doesn't in-memory storage of records while parsing. Able to parse large MARCXML file with ease.
* A MARC record object model for in-memory editing of MARC records, similar to the Marc4J object model

## Examples

Examples can be found in the the [marc4js_examples](https://github.com/jiaola/marc4js_examples)

## Usage

```javascript
var marc4js = require('marc4js');
```

### Parsers

Parsers take various MARC formats and convert them to `marc4js.marc.Record` objects. Marc4js supports ISO2709, text
(MarcEdit .mrc file) and MARCXML formats.

There are three ways to use a parser.

#### Callback API

```
marc4js.parse(data, options, function(err, records) {
});
```

#### Stream API

```javascript
var parser = marc4js.parse(options);
parser.on('data', function(record) {
});
parser.on('end', function() {
});
parser.on('error', function(err) {
});
parser.write(data);
parser.end();
```

All events are based on [the Node.js stream API](http://nodejs.org/api/stream.html).

Note that the parsers always work in the paused (aka non-flowing) streaming mode - therefore the `objectMode` option of
the stream api is disabled, and is always set to `true`. Listening to the `readable` event will throw an erorr.

#### Pipe function

```javascript
var parser = marc4js.parse(options);
fs.createReadStream('/path/to/your/file').pipe(parser).pipe(transformer).pipe(process.stdout);
```

#### options

`fromFormat`: default `iso2709`, possible values `iso2709`, `marc`, `text`, `mrk`, `marcxml`, `xml`

#### Different types of parsers

##### Iso2709Parser

Parses ISO2709 format. Used by default or when `fromFormat` is `iso2709` or `marc`

##### MrkParser

Parses MarcEdit text format (.mrk files). Used when `fromFormat` is `text` or `mrk`

Other options:

* `spaceReplace`: In MarcEdit mrk files, spaces in data field indicators or control fields are replace by `\`. By default
MrkPaser will convert `\` to space in those places. It can be configured with this option.

##### MarcxmlParser

Parses MarcEdit text format (.mrk files). Used when `fromFormat` is `marcxml` or `xml`

The stream and pipe API is SAX based so it doesn't require in-memory storage of the records. This is suitable for processing large MARCXML file.
The callback API will read all records in memory and return it in the callback function and is not advised to process large MARCXML file.

Other options:

* `strict`: default is `false`. When in `strict` mode, the parser will fail if the XML is not well-formatted. For details, see the `strict` option in [sax-js](https://github.com/isaacs/sax-js).

##### MijParser

Parses [MARC-in-JSON](http://dilettantes.code4lib.org/blog/2010/09/a-proposal-to-serialize-marc-in-json/) format. Used when `fromFormat` is `json` or `mij`.

The stream and pipe API uses a sax-like JSON stream parser so it doesn't require in-memory storage of the records. Thus it can process
large number of MARC-in-JSON records.

### Transformers

Transformers transform the `marc4js.marc.Record` objects into various MARC formats. Marc4js supports ISO2709, text
(MarcEdit .mrc file) and MARCXML formats.

Like parsers, transformers can also be used in three different ways.

#### Callback API

```
marc4js.transform(records, options, function(err, output) {
});
```

#### Stream API

```javascript
var transformer = marc4js.transform(options);
transformer.on('readable', function(output) {
});
transformer.on('end', function() {
});
transformer.on('error', function(err) {
});
transformer.write(record); // one record
// or to write an array of records
// records.forEach(function(record) {
//     transformer.write(record);
// });
transformer.end();
```

Note that even though parsers can be only in the flowing mode, the transformers can use either flowing or paused (aka non-flowing) mode in the
[stream API](http://nodejs.org/api/stream.html). In the above example it's using the paused mode, but it can also use the `data` event handler
if flowing mode is used.

#### Pipe function

```javascript
var transformer = marc4js.transform(options);
fs.createReadStream('/path/to/your/file').pipe(parser).pipe(transformer).pipe(process.stdout);
```

#### options

`toFormat`: default `iso2709`, possible values `iso2709`, `marc`, `text`, `mrk`, `marcxml`, `xml`
`objectMode`: default `false`. Used to switch between the flowing and paused (aka non-flowing) mode in the [stream API](http://nodejs.org/api/stream.html).

#### Different types of Transformers

##### Iso2709Transformer

Outputs ISO2709 format. Used by default or when `toFormat` is `iso2709` or `marc`

##### MrkTransformer

Outputs MarcEdit text format (.mrk files). Used when `toFormat` is `text` or `mrk`

Other options:

* `spaceReplace`: by default space in data field indicators and control fields are replaced with `\`. But it can be configured with this option.

##### MarcxmlTransformer

Outputs MarcEdit text format (.mrk files). Used when `toFormat` is `marcxml` or `xml`

Other options:

* `pretty`: default is `true`. Output XML in pretty format. If set to false, new indentation and line-breakers in outputs.
* `indent`: default is `'  '` (two spaces). Used to indent lines in pretty format.
* `newline`: default is `\n`. Used in pretty format.
* `declaration`: default is `true`. If set to `false`, the XML declaration line (`<?xml versiont ...>`) is not included in the output.
* `root`: default is `true`. If `false`, the root `<collection>` element is not included in the output.

##### MijTransformer

Outputs [MARC-in-JSON](http://dilettantes.code4lib.org/blog/2010/09/a-proposal-to-serialize-marc-in-json/) string. Used when `toFormat` is `json` or `mij`.

Other options:

* asArray: default is `true`. By default the output will be in an JSON array format, even if there is only one record.
If this option set to false, the output will not write the enclosing brackets `[` and `]` at the beginning and end of the output.


