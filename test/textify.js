'use strict';

var fs = require('fs');
var os = require('os');
var textify = require('../lib/textify');
var parse = require('../lib/parse');
var Record = require('../lib/marc/record');
var Subfield = require('../lib/marc/subfield');
var DataField = require('../lib/marc/data_field');
var ControlField = require('../lib/marc/control_field');
var Leader = require('../lib/marc/leader');


describe('textify', function () {
    var records;
    before(function () {
        records = [];
        var r1 = new Record();
        r1.leader = new Leader('00307nam a2200085Ia 45e0');
        r1.addVariableField(new ControlField("008", "080906s9999    xx            000 0 und d"));
        r1.addVariableField(new DataField("100", '1', ' ', [["a", "Biggers, Earl Derr."]]));
        r1.addVariableField(new DataField("245", '1', '0', [["a", "Charlie Chan Carries On"], ["h", "[electronic resource]"]]));
        r1.addVariableField(new DataField("500", ' ', ' ', [["a", "An ebook provided by Project Gutenberg Australia"]]));
        r1.addVariableField(new DataField("856", '4', '0', [["u", "http://gutenberg.net.au/ebooks07/0700761h.html "]]));
        records.push(r1);

        var r2 = new Record();
        r2.leader = new Leader('00287nam a2200085Ia 45e0');
        r2.addVariableField(new ControlField("008", "080906s9999    xx            000 0 und d"));
        r2.addVariableField(new DataField("100", '1', ' ', [["a", "Wallace, Edgar."]]));
        r2.addVariableField(new DataField("245", '1', '0', [["a", "Sanders"], ["h", "[electronic resource]"]]));
        r2.addVariableField(new DataField("500", ' ', ' ', [["a", "An ebook provided by Project Gutenberg Australia"]]));
        r2.addVariableField(new DataField("856", '4', '0', [["u", "http://gutenberg.net.au/ebooks07/0700771h.html "]]));
        records.push(r2);
    });

    it('should textify the records with callback', function(done) {
        fs.readFile('samples/PGA_2records.mrk', function(err, data) {
            data = data.toString().replace(/\r\n?/g, os.EOL) + os.EOL;
            textify(records, function(err, output) {

                for (var i = 0; i < output.length; i++) {
                    var c1 = output.charAt(i);
                    var c2 = data.charAt(i);
                    //if (c1 !== c2) {
                        console.log(i);
                        console.log('c1: ', c1); //, output.charCodeAt(i).toString(16));
                        console.log('c2: ', c2); //, data.toString().charCodeAt(i).toString(16));
                        if (c1 != c2) break;
                    //}
                }

                expect(output.length).equal(data.length);
                expect(output).equal(data);
                done();
            });
        });
    });

    it('should textify one record', function(done) {
        textify(records[0], function(err, output) {
            expect(output).to.be.not.null;
            console.log(output);
            done();
        });
    });

    it('should provide a flowing stream API', function(done) {
        var textifier = textify({objectMode: true});
        var output = '';
        textifier.on('data', function(record) {
            output += record;
        });
        textifier.on('error', function(err) {
            console.log(err.message);
        });
        textifier.on('end', function() {
            fs.readFile('samples/PGA_2records.mrk', function(err, data) {
                data = data.toString().replace(/\r\n?/g, os.EOL) + os.EOL;
                expect(output.length).equal(data.length);
                expect(output).equal(data.toString());
                done();
            });
        });
        records.forEach(function(record) {
            textifier.write(record);
        });
        textifier.end();

    });

    it('should provide a non-flowing stream API', function(done) {
        var textifier = textify({objectMode: false});
        var output = '';
        textifier.on('readable', function() {
            var record;
            while (record = textifier.read()) {
                output += record;
            }
        });
        textifier.on('error', function(err) {
            console.log(err.message);
        });
        textifier.on('end', function() {
            fs.readFile('samples/PGA_2records.mrk', function(err, data) {
                data = data.toString().replace(/\r\n?/g, os.EOL) + os.EOL;
                expect(output.length).equal(data.length);
                expect(output).equal(data.toString());
                done();
            });
        });
        records.forEach(function(record) {
            textifier.write(record);
        });
        textifier.end();
    });
});