[![Build Status](https://travis-ci.org/jiaola/marc4js.svg?branch=master)](https://travis-ci.org/jiaola/marc4js)

A Node.js module for handling MARC records

## Installation

```
npm install marc4js

```

## Usage

### Parsers

#### Parse MARC file

### Transformers
Transformers transform the MARC recrod objects into other formats.

#### `marc4js.parse`
`marc4js.parse` parse a string in MARC format and creates `marc4js.marc.Record` objects.

##### Using the callback API
```javascript

```

##### Using the stream API

##### Using the pipe function

#### `marc4js.stringify`

`marc4js.stringify` converts `marc4js.marc.Record` objects into MARC strings.

##### Using the callback API

##### Using the stream API

##### Using the pipe function

All examples are downloaded from the [Open Access Bibliographic Records by University of Michigan
Libraries](http://www.lib.umich.edu/open-access-bibliographic-records).

