[![Build Status](https://travis-ci.org/jiaola/marc4js.svg?branch=master)](https://travis-ci.org/jiaola/marc4js)

A Node.js module for handling MARC records

## Installation

```
npm install marc4js
```

## Features

In the current release (version 0.0.2), marc4js provides the following features

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

#### Pipe function

```javascript
var parser = marc4js.parse(options);
fs.createReadStream('/path/to/your/file').pipe(parser).pipe(transformer).pipe(process.stdout);
```

#### options

`fromFormat`: default `iso2709`, possible values `iso2709`, `marc`, `text`, `mrk`, `marcxml`, `xml`

#### Different types of parsers

##### ISO2709Parser

Parses ISO2709 format. Used by default or when `fromFormat` is `iso2709` or `marc`

##### MrkParser

Parses MarcEdit text format (.mrk files). Used when `fromFormat` is `text` or `mrk`

Other options:

`spaceReplace`: In MarcEdit mrk files, spaces in data field indicators or control fields are replace by `\`. By default
MrkPaser will convert `\` to space in those places. It can be configured with this option.

##### MarcxmlParser

Parses MarcEdit text format (.mrk files). Used when `fromFormat` is `marcxml` or `xml`

The stream and pipe API is SAX based so it doesn't require in-memory storage of the records. This is suitable for processing large MARCXML file.
The callback API will read all records in memory and return it in the callback function and is not advised to process large MARCXML file.

Other options:

`strict`: default is `false`. When in `strict` mode, the parser will fail if the XML is not well-formatted. For details, see the `strict` option in [sax-js](https://github.com/isaacs/sax-js).

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
transformer.on('data', function(output) {
});
transformer.on('end', function() {
});
transformer.on('error', function(err) {
});
transformer.write(records);
transformer.end();
```

#### Pipe function

```javascript
var transformer = marc4js.transform(options);
fs.createReadStream('/path/to/your/file').pipe(parser).pipe(transformer).pipe(process.stdout);
```

#### options

`toFormat`: default `iso2709`, possible values `iso2709`, `marc`, `text`, `mrk`, `marcxml`, `xml`

#### Different types of parsers

##### ISO2709Transformer

Outputs ISO2709 format. Used by default or when `toFormat` is `iso2709` or `marc`

##### MrkTransformer

Outputs MarcEdit text format (.mrk files). Used when `toFormat` is `text` or `mrk`

Other options:

`spaceReplace`: by default space in data field indicators and control fields are replaced with `\`. But it can be configured with this option.

##### MarcxmlTransformer

Outputs MarcEdit text format (.mrk files). Used when `toFormat` is `marcxml` or `xml`

Other options:

`pretty`: default is `true`. Output XML in pretty format. If set to false, new indentation and line-breakers in outputs.
`indent`: default is `'  '` (two spaces). Used to indent lines in pretty format.
`newline`: default is `\n`. Used in pretty format.
`declaration`: default is `true`. If set to false, the XML declaration line (<?xml versiont ...>) is not included in the output.
`root`: default is `true`. If `false`, the root `<collection>` element is not included in the output.




