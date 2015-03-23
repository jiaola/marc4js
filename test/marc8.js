var parse = require('../lib/parse');
var transform = require('../lib/transform');
var fs = require('fs');
var marc8 = require('marc8');

describe('marc8', function () {
    it('should parse marc8 encoded file', function(done) {
        var utf8 = fs.readFileSync('test/data/utf8.mrc').toString();
        fs.readFile('test/data/marc8.mrc', {encoding: 'binary'}, function(err, data) {
            parse(data, {fromFormat: 'iso2709', marc8: true, marc8converter: require('marc8')}, function(err, records) {
                expect(records.length).to.equal(1);
                var record = records[0];
                var fields = record.dataFields;
                fields.forEach(function(field) {
                    if (field.tag == '240') {
                        expect(utf8.indexOf(field.subfields[0].data)).to.be.least(0);
                    } else if (field.tag == '008') {
                        expect(field.data).equal('840112s1962 pau b 00010 eng');
                    }
                });
                done();
            });
        });
    });

    it('should parse marc8 encoded file with accented chars', function(done) {
        fs.readFile('test/data/marc8_accented_chars.mrc', {encoding: 'binary'}, function(err, data) {
            parse(data, {fromFormat: 'iso2709', marc8: true, marc8converter: require('marc8')}, function(err, records) {
                expect(records.length).equal(1);
            });
            done();
        });
    });

    it('should parse a file with mixed marc8 and utf8 encoding', function(done) {
        fs.readFile('test/data/marc8_utf8_mixed.mrc', {encoding: 'binary'}, function(err, data) {
            parse(data, {fromFormat: 'iso2709', marc8converter: marc8}, function(err, records) {
                expect(records.length).equal(6);
            });
            done();
        });
    });
});
