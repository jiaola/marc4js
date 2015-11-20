var parse = require('../lib/parse');
var transform = require('../lib/transform');
var fs = require('fs');
var marc8 = require('marc8');

describe('parse', function () {
    var stream;

    before(function () {
    });

    it('should parse one record and identify fields', function (done) {
        var stream = fs.createReadStream('test/data/sandburg.mrc');
        var parser = parse({objectMode: true});

        var first;
        var count = 0;
        parser.on('data', function (record) {
            count += 1;
            if (count === 1) first = record;
        });

        stream.pipe(parser);

        parser.on('error', function (error) {
            console.log("error: ", error);
            done();
        });

        parser.on('end', function () {
            expect(count).equal(1);
            expect(first.variableFields.length).to.equal(23);
            expect(first.controlFields.length).equal(4);
            done();
        });
    });

    it('should parse multiple records', function (done) {
        var stream = fs.createReadStream('test/data/collection.mrc');
        var parser = parse({objectMode: true, fromFormat: 'marc'});

        var count = 0;
        parser.on('data', function () {
            count += 1;
        });

        stream.pipe(parser);

        parser.on('error', function (error) {
            console.log("error: ", error);
            done();
        });

        parser.on('end', function () {
            expect(count).equal(2);
            done();
        });
    });

    it('should work with callback API', function(done) {
        var data = fs.readFileSync('test/data/collection.mrc');
        parse(data, {objectMode: true}, function(err, records) {
            if (err) {
                console.log(err);
            } else {
                expect(records.length).equal(2);
            }
            done();
        });
    });

    it('should work with stream API', function(done) {
        var data = '00783nam a2200217Ki 4500001000800000005001700008006001900025007001500044008004100059042000700100092001000107245005000117260007600167300004800243500005500291500003200346540005700378655002200435710002300457856008500480PG1060720101216083600.0m||||||||d||||||||cr||n |||muaua101213s2004    utu     o           eng d  adc  aeBook04aThe Real Mother Gooseh[electronic resource].  aSalt Lake City :bProject Gutenberg Literary Archive Foundation,c2004.  a1 online resource :bmultiple file formats.  aRecords generated from Project Gutenberg RDF data.  aISO 639-2 language code: en  aApplicable license: http://www.gutenberg.org/license 0aElectronic books.2 aProject Gutenberg.40uhttp://www.gutenberg.org/etext/10607yClick here to access a downloadable ebook.';
        var parser = parse({objectMode: true});

        var count = 0;
        parser.on('data', function (record) {
            var fields = record.dataFields;
            var field = fields[fields.length - 1];
            expect(field.indicator1).equal('4');
            expect(field.indicator2).equal('0');
            count += 1;
        });

        parser.on('error', function (error) {
            console.log("error: ", error);
        });

        parser.on('end', function () {
            expect(count).equal(1);
            done();
        });

        parser.write(data);
        parser.end();
    });

    it('should parse mrk format', function(done) {
        var data = fs.readFileSync('test/data/collection.mrk');
        //console.log(data);
        parse(data, {fromFormat: 'mrk'}, function(err, records) {
            if (err) {
                console.log(err);
            } else {
                expect(records.length).to.equal(2);
                expect(records[1].leader.marshal()).equal('01832cmmaa2200349 a 4500');
            }
            done();
        });
    });

    it('should parse MARCXML', function(done) {
        var data = fs.readFileSync('test/data/sandburg.xml');
        parse(data.toString(), {fromFormat: 'marcxml'}, function(err, records) {
            if (err) {
                console.log(err);
            } else {
                expect(records.length).equal(1);
                expect(records[0].leader.marshal()).equal('01142cam  2200301 a 4500');
                expect(records[0].dataFields[6].subfields[1].code).equal('d');
            }
            done();
        });
    });

    it('should parse MARCXML with multiple records and namespace', function(done) {
        var data = fs.readFileSync('test/data/collection.xml');
        parse(data.toString(), {fromFormat: 'marcxml'}, function(err, records) {
            if (err) {
                console.log(err);
            } else {
                expect(records.length).equal(2);
                expect(records[1].leader.marshal()).equal('01832cmma 2200349 a 4500');
            }
            done();
        });
    });

    it('should parse marc in json', function(done) {
        var data = fs.readFileSync('test/data/marc_in_json.json');
        parse(data.toString(), {fromFormat: 'json'}, function(err, records) {
            expect(records.length).equal(1);
            done();
        });
    });

    it('should parse marc-in-json with multiple records', function(done) {
        var data = fs.readFileSync('test/data/collection.json');
        parse(data.toString(), {fromFormat: 'json'}, function(err, records) {
            console.log(records.length);
            expect(records.length).equal(2);
            expect(records[1].leader.marshal()).equal('01832cmma 2200349 a 4500');
            done();
        });
    });

    it('should parse file with only utf8', function(done) {
        var data = fs.readFileSync('test/data/utf8_only.mrc');
        parse(data, {fromFormat: 'iso2709', marc8converter: marc8}, function(err, records) {
            expect(records.length).equal(6);
            transform(records, {toFormat: 'text'}, function(err, output) {
                expect(output.indexOf('黑澤明')).to.be.least(0);
                expect(output.indexOf('Premio del Público 27°')).to.be.least(0);
                done();
            });
        });
    });

    it('should return empty array for a blank string', function(done) {
        "use strict";
        var data = "";
        parse(data, {fromFormat: 'text'}, function(err, records) {
            expect(records.length).to.equal(0);
            done();
        });
    });

    it('should return empty array for a null string', function(done) {
        "use strict";
        var data = null;
        parse(data, {fromFormat: 'text'}, function(err, records) {
            expect(records.length).to.equal(0);
            done();
        });
    });
});
