'use strict';

var fs = require('fs');
var os = require('os');
var transform = require('../lib/transform');
var parse = require('../lib/parse');
var Record = require('../lib/marc/record');
var Subfield = require('../lib/marc/subfield');
var DataField = require('../lib/marc/data_field');
var ControlField = require('../lib/marc/control_field');
var Leader = require('../lib/marc/leader');


describe('transform', function () {
    var records;
    before(function () {
        records = [];
        var r1 = new Record();
        r1.leader = new Leader('00307nam a2200085Ia 45e0');
        r1.addVariableField(new ControlField("008", "080906s9999    xx            000 0 und d"));
        r1.addVariableField(new DataField("100", '1', ' ', [["a", "Biggers, Earl Derr."]]));
        r1.addVariableField(new DataField("245", '1', '0', [["a", "Charlie Chan Carries On"], ["h", "[electronic resource]"]]));
        r1.addVariableField(new DataField("500", ' ', ' ', [["a", "An ebook provided by Project Gutenberg Australia"]]));
        r1.addVariableField(new DataField("856", '4', '0', [["u", "http://gutenberg.net.au/ebooks07/0700761h.html"]]));
        records.push(r1);

        var r2 = new Record();
        r2.leader = new Leader('00287nam a2200085Ia 45e0');
        r2.addVariableField(new ControlField("008", "080906s9999    xx            000 0 und d"));
        r2.addVariableField(new DataField("100", '1', ' ', [["a", "Wallace, Edgar."]]));
        r2.addVariableField(new DataField("245", '1', '0', [["a", "Sanders"], ["h", "[electronic resource]"]]));
        r2.addVariableField(new DataField("500", ' ', ' ', [["a", "An ebook provided by Project Gutenberg Australia"]]));
        r2.addVariableField(new DataField("856", '4', '0', [["u", "http://gutenberg.net.au/ebooks07/0700771h.html"]]));
        records.push(r2);
    });

    it('should stringify the records with callback', function(done) {
        var data = fs.readFileSync('test/data/PGA_2records.mrc');
        transform(records, function(err, output) {
            expect(output.length).equal(data.length);
            expect(output).equal(data.toString());
            done();
        });
    });

    it('should stringify one record', function(done) {
        transform(records[0], function(err, output) {
            expect(output).to.be.not.null;
            done();
        });
    });

    it('should stringify with a flowing stream API', function(done) {
        var transformer = transform({objectMode: true});
        var output = '';
        transformer.on('data', function(record) {
            output += record;
        });
        transformer.on('error', function(err) {
            console.log(err.message);
        });
        transformer.on('end', function() {
            var data = fs.readFileSync('test/data/PGA_2records.mrc');
            expect(output.length).equal(data.length);
            expect(output).equal(data.toString());
            done();
        });
        records.forEach(function(record) {
            transformer.write(record);
        });
        transformer.end();

    });

    it('should stringify with a non-flowing stream API', function(done) {
        var transformer = transform({objectMode: false, toFormat: 'iso2709'});
        var output = '';
        transformer.on('readable', function() {
            var record;
            while (record = transformer.read()) {
                output += record;
            }
        });
        transformer.on('error', function(err) {
            console.log(err.message);
        });
        transformer.on('end', function() {
            var data = fs.readFileSync('test/data/PGA_2records.mrc');
            expect(output.length).equal(data.length);
            expect(output).equal(data.toString());
            done();
        });
        records.forEach(function(record) {
            transformer.write(record);
        });
        transformer.end();
    });

    it('should pipe to destination', function(done) {
        var transformer = transform({objectMode: true});
        var parser = parse({objectMode: true});
        var mrc = '00783nam a2200217Ki 4500001000800000005001700008006001900025007001500044008004100059042000700100092001000107245005000117260007600167300004800243500005500291500003200346540005700378655002200435710002300457856008500480PG1060720101216083600.0m||||||||d||||||||cr||n |||muaua101213s2004    utu     o           eng d  adc  aeBook04aThe Real Mother Gooseh[electronic resource].  aSalt Lake City :bProject Gutenberg Literary Archive Foundation,c2004.  a1 online resource :bmultiple file formats.  aRecords generated from Project Gutenberg RDF data.  aISO 639-2 language code: en  aApplicable license: http://www.gutenberg.org/license 0aElectronic books.2 aProject Gutenberg.40uhttp://www.gutenberg.org/etext/10607yClick here to access a downloadable ebook.';
        var ws = fs.createWriteStream('/tmp/the_real_mother_goose.mrc');
        var is = fs.createReadStream('test/data/the_real_mother_goose.mrc');
        return is.pipe(parser).pipe(transformer).pipe(ws).on('finish', function() {
            return fs.readFile('/tmp/the_real_mother_goose.mrc', function(err, data) {
                //expect(data.toString().length).equal(mrc.length);
                expect(data.toString()).equal(mrc);
                return fs.unlink('/tmp/the_real_mother_goose.mrc', done);
            });
        });
    });

    it('should mrkify the records with callback', function(done) {
        var data = fs.readFileSync('test/data/PGA_2records.mrk');
        data = data.toString().replace(/\r\n?/g, os.EOL) + os.EOL;
        transform(records, {format: 'mrk'}, function(err, output) {
            expect(output.length).equal(data.length);
            expect(output).equal(data);
            done();
        });
    });

    it('should mrkify one record', function(done) {
        transform(records[0], {toFormat: 'mrk'}, function(err, output) {
            expect(output).to.be.not.null;
            done();
        });
    });

    it('should mrkify with a flowing stream API', function(done) {
        var textifier = transform({objectMode: true, format: 'mrk'});
        var output = '';
        textifier.on('data', function(record) {
            output += record;
        });
        textifier.on('error', function(err) {
            console.log(err.message);
        });
        textifier.on('end', function() {
            var data = fs.readFileSync('test/data/PGA_2records.mrk');
            data = data.toString().replace(/\r\n?/g, os.EOL) + os.EOL;
            expect(output.length).equal(data.length);
            expect(output).equal(data.toString());
            done();
        });
        records.forEach(function(record) {
            textifier.write(record);
        });
        textifier.end();
    });

    it('should mrkify with a non-flowing stream API', function(done) {
        var textifier = transform({objectMode: false, format: 'mrk'});
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
            var data = fs.readFileSync('test/data/PGA_2records.mrk');
            data = data.toString().replace(/\r\n?/g, os.EOL) + os.EOL;
            expect(output.length).equal(data.length);
            expect(output).equal(data.toString());
            done();
        });
        records.forEach(function(record) {
            textifier.write(record);
        });
        textifier.end();
    });

    it('should textify the records with callback', function(done) {
        var data = fs.readFileSync('test/data/PGA_2records.txt');
        data = data.toString().replace(/\r\n?/g, os.EOL) + os.EOL;
        transform(records, {format: 'text'}, function(err, output) {
            expect(output.length).equal(data.length);
            expect(output).equal(data);
            done();
        });
    });

    it('should textify one record', function(done) {
        transform(records[0], {toFormat: 'text'}, function(err, output) {
            expect(output).to.be.not.null;
            done();
        });
    });

    it('should textify with a flowing stream API', function(done) {
        var textifier = transform({objectMode: true, format: 'text'});
        var output = '';
        textifier.on('data', function(record) {
            output += record;
        });
        textifier.on('error', function(err) {
            console.log(err.message);
        });
        textifier.on('end', function() {
            var data = fs.readFileSync('test/data/PGA_2records.txt');
            data = data.toString().replace(/\r\n?/g, os.EOL) + os.EOL;
            expect(output.length).equal(data.length);
            expect(output).equal(data.toString());
            done();
        });
        records.forEach(function(record) {
            textifier.write(record);
        });
        textifier.end();
    });

    it('should textify with a non-flowing stream API', function(done) {
        var textifier = transform({objectMode: false, format: 'text'});
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
            var data = fs.readFileSync('test/data/PGA_2records.txt');
            data = data.toString().replace(/\r\n?/g, os.EOL)  + os.EOL;
            expect(output.length).equal(data.length);
            expect(output).equal(data.toString());
            done();
        });
        records.forEach(function(record) {
            textifier.write(record);
        });
        textifier.end();
    });

    it('should marcxmlify with a non-flowing stream API', function(done) {
        transform(records[0], {toFormat: 'marcxml'}, function(err, output) {
            expect(output).to.be.not.null;
            done();
        });
    });

    it('should transform to marc-in-json format', function(done) {
        transform(records, {toFormat: 'mij'}, function(err, output) {
            expect(output).to.be.not.null;
            var obj = JSON.parse(output);
            expect(obj[0].leader).equal('00307nam a2200085Ia 45e0');
            expect(obj[1].fields.length).equal(5);
            done();
        });
    });

});