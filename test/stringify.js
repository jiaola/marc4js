'use strict';

var fs = require('fs')
var stringify = require('../lib/stringify');
var parse = require('../lib/parse')
var Record = require('../lib/marc/record');
var Subfield = require('../lib/marc/subfield');
var DataField = require('../lib/marc/data_field');
var ControlField = require('../lib/marc/control_field');
var Leader = require('../lib/marc/leader');


describe('stringify', function () {
    var records;
    before(function () {
        records = [];
        var r1 = new Record();
        r1.leader = new Leader('00759cam a2200229 a 4500');
        r1.addVariableField(new ControlField("001", "11939876"));
        r1.addVariableField(new ControlField("005", "20041229190604.0"));
        r1.addVariableField(new ControlField("008", "000313s2000    nyu           000 1 eng  "));
        r1.addVariableField(new DataField("020", ' ', ' ', [["a", "0679450041 (acid-free paper)"]]));
        r1.addVariableField(new DataField("040", ' ', ' ', [["a", "DLC"], ["c", "DLC"], ["d", "DLC"]]));
        r1.addVariableField(new DataField("100", '1', ' ', [["a", "Chabon, Michael."]]));
        r1.addVariableField(new DataField("245", '1', '4', [["a", "The amazing adventures of Kavalier and Clay :"], ["b", "a novel /"], ["c", "Michael Chabon."]]));
        r1.addVariableField(new DataField("260", ' ', ' ', [["a", "New York :"], ["b", "Random House,"], ["c", "c2000."]]));
        r1.addVariableField(new DataField("300", ' ', ' ', [["a", "639 p. ;"], ["c", "25 cm."]]));
        r1.addVariableField(new DataField("650", ' ', '0', [["a", "Comic books, strips, etc."], ["x", "Authorship"], ["v", "Fiction."]]));
        r1.addVariableField(new DataField("650", ' ', '0', [["a", "Heroes in mass media"], ["v", "Fiction."]]));
        r1.addVariableField(new DataField("650", ' ', '0', [["a", "Czech Americans"], ["v", "Fiction."]]));
        r1.addVariableField(new DataField("651", ' ', '0', [["a", "New York (N.Y.)"], ["v", "Fiction."]]));
        r1.addVariableField(new DataField("650", ' ', '0', [["a", "Young men"], ["v", "Fiction."]]));
        r1.addVariableField(new DataField("650", ' ', '0', [["a", "Cartoonists"], ["v", "Fiction."]]));
        r1.addVariableField(new DataField("655", ' ', '7', [["a", "Humorous stories."], ["2", "gsafd"]]));
        r1.addVariableField(new DataField("655", ' ', '7', [["a", "Bildungsromane."], ["2", "gsafd"]]));
        records.push(r1);

        var r2 = new Record();
        r2.leader = new Leader('00714cam a2200205 a 4500"');
        r2.addVariableField(new ControlField("001", "12883376"));
        r2.addVariableField(new ControlField("005", "20030616111422.0"));
        r2.addVariableField(new ControlField("008", "020805s2002    nyu    j      000 1 eng  "));
        r2.addVariableField(new DataField("020", ' ', ' ', [["a", "0786808772"]]));
        r2.addVariableField(new DataField("020", ' ', ' ', [["a", "0786816155 (pbk.)"]]));
        r2.addVariableField(new DataField("040", ' ', ' ', [["a", "DLC"], ["c", "DLC"], ["d", "DLC"]]));
        r2.addVariableField(new DataField("100", '1', ' ', [["a", "Chabon, Michael."]]));
        r2.addVariableField(new DataField("245", '1', '0', [["a", "Summerland /"], ["c", "Michael Chabon."]]));
        r2.addVariableField(new DataField("250", ' ', ' ', [["a", "1st ed."]]));
        r2.addVariableField(new DataField("260", ' ', ' ', [["a", "New York :"], ["b", "Miramax Books/Hyperion Books for Children,"], ["c", "c2002."]]));
        r2.addVariableField(new DataField("300", ' ', ' ', [["a", "500 p. ;"], ["c", "22 cm."]]));
        r2.addVariableField(new DataField("520", ' ', ' ', [["a", "Ethan Feld, the worst baseball player in the history of the game, finds himself recruited by a 100-year-old scout to help a band of fairies triumph over an ancient enemy."]]));
        r2.addVariableField(new DataField("650", ' ', '1', [["a", "Fantasy."]]));
        r2.addVariableField(new DataField("650", ' ', '1', [["a", "Baseball"], ["v", "Fiction."]]));
        r2.addVariableField(new DataField("650", ' ', '1', [["a", "Magic"], ["v", "Fiction."]]));
        records.push(r2);
    });

    it('should stringify the records with callback', function(done) {
        fs.readFile('test/data/chabon.mrc', function(err, data) {
            stringify(records, function(err, output) {
                expect(output.length).equal(data.length);
                expect(output).equal(data.toString());
            });
            done();
        });
    });

    it('should provide a flowing stream API', function(done) {
        var stringifier = stringify({objectMode: true});
        var output = '';
        stringifier.on('data', function(record) {
            output += record;
        });
        stringifier.on('error', function(err) {
            console.log(err.message);
        });
        stringifier.on('end', function() {
            fs.readFile('test/data/chabon.mrc', function(err, data) {
                expect(output.length).equal(data.length);
                expect(output).equal(data.toString());
                done();
            });
        });
        records.forEach(function(record) {
            stringifier.write(record);
        });
        stringifier.end();

    });

    it('should provide a non-flowing stream API', function(done) {
        var stringifier = stringify({objectMode: false});
        var output = '';
        stringifier.on('readable', function() {
            var record;
            while (record = stringifier.read()) {
                output += record;
            }
        });
        stringifier.on('error', function(err) {
            console.log(err.message);
        });
        stringifier.on('end', function() {
            fs.readFile('test/data/chabon.mrc', function(err, data) {
                expect(output.length).equal(data.length);
                expect(output).equal(data.toString());
                done();
            });
        });
        records.forEach(function(record) {
            stringifier.write(record);
        });
        stringifier.end();
    });

    it('pipe to destination', function(done) {
        var stringifier = stringify({objectMode: true});
        var parser = parse({objectMode: true});
        var mrc = '00714cam a2200205 a 45000010009000000050017000090080041000260200015000670200022000820400018001041000021001222450034001432500012001772600067001893000021002565200175002776500013004526500023004656500020004881288337620030616111422.0020805s2002    nyu    j      000 1 eng    a0786808772  a0786816155 (pbk.)  aDLCcDLCdDLC1 aChabon, Michael.10aSummerland /cMichael Chabon.  a1st ed.  aNew York :bMiramax Books/Hyperion Books for Children,cc2002.  a500 p. ;c22 cm.  aEthan Feld, the worst baseball player in the history of the game, finds himself recruited by a 100-year-old scout to help a band of fairies triumph over an ancient enemy. 1aFantasy. 1aBaseballvFiction. 1aMagicvFiction.';
        var ws = fs.createWriteStream('/tmp/summerland.mrc');
        var is = fs.createReadStream('test/data/summerland.mrc');
        return is.pipe(parser).pipe(stringifier).pipe(ws).on('finish', function() {
            return fs.readFile('/tmp/summerland.mrc', function(err, data) {
                expect(data.toString().length).equal(mrc.length);
                return fs.unlink('/tmp/summerland.mrc', done);
            });
        });
    });
});