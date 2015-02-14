'use strict';

// run this in the marc4js directory
// node samples/stringify_callback.js

var marc4js = require('marc4js');

// build a record from scratch
var record = new marc4js.marc.Record();
record.leader = new marc4js.marc.Leader('00307nam a2200085Ia 45e0');
record.addVariableField(new marc4js.marc.ControlField("008", "080906s9999    xx            000 0 und d"));
record.addVariableField(new marc4js.marc.DataField("100", '1', ' ', [["a", "Biggers, Earl Derr."]]));
record.addVariableField(new marc4js.marc.DataField("245", '1', '0', [["a", "Charlie Chan Carries On"], ["h", "[electronic resource]"]]));
record.addVariableField(new marc4js.marc.DataField("500", ' ', ' ', [["a", "An ebook provided by Project Gutenberg Australia"]]));
record.addVariableField(new marc4js.marc.DataField("856", '4', '0', [["u", "http://gutenberg.net.au/ebooks07/0700761h.html "]]));

// converts a single record
marc4js.stringify(record, {}, function(err, data) {
    console.log(data);
});

// build an array of records
var records = [];
records.push(record);

var record2 = new marc4js.marc.Record();
record2.leader = new marc4js.marc.Leader('00287nam a2200085Ia 45e0');
record2.addVariableField(new marc4js.marc.ControlField("008", "080906s9999    xx            000 0 und d"));
record2.addVariableField(new marc4js.marc.DataField("100", '1', ' ', [["a", "Wallace, Edgar."]]));
record2.addVariableField(new marc4js.marc.DataField("245", '1', '0', [["a", "Sanders"], ["h", "[electronic resource]"]]));
record2.addVariableField(new marc4js.marc.DataField("500", ' ', ' ', [["a", "An ebook provided by Project Gutenberg Australia"]]));
record2.addVariableField(new marc4js.marc.DataField("856", '4', '0', [["u", "http://gutenberg.net.au/ebooks07/0700771h.html "]]));
records.push(record2);

// converts an array of records
marc4js.stringify(records, {}, function(err, data) {
    console.log(data);
});