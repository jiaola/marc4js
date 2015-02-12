var parse = require('../lib/parse');
var fs = require('fs');

describe('parse', function () {
    var stream;

    before(function () {
    });

    it('should have two records and the first record should have 17 variable fields, ' +
    'including 3 control fields', function (done) {
        var stream = fs.createReadStream('test/data/chabon.mrc');
        var ms = parse({objectMode: true});

        var first;
        var count = 0;
        ms.on('data', function (record) {
            count += 1;
            if (count === 1) first = record;
        });

        stream.pipe(ms);

        ms.on('error', function (error) {
            console.log("error: ", error);
        })

        ms.on('end', function () {
            expect(count).equal(2);
            expect(first.variableFields.length).equal(17);
            expect(first.controlFields.length).equal(3);
            done();
        });
    });

    it('should have only one record', function (done) {
        var stream = fs.createReadStream('test/data/summerland.mrc');
        //expect(count).equal(0);
        var ms = parse({objectMode: true});

        var count = 0;
        ms.on('data', function (record) {
            count += 1;
        });

        stream.pipe(ms);

        ms.on('error', function (error) {
            console.log("error: ", error);
        })

        ms.on('end', function () {
            expect(count).equal(1);
            done();
        });
    });

    it('should work with callback API', function(done) {
        fs.readFile('test/data/summerland.mrc', function(err, data) {
            parse(data, {objectMode: true}, function(err, records) {
                if (err) {
                    return console.log(err);
                }
                expect(records.length).equal(1);
                expect(records[0].variableFields.length).equal(15);
            });
            done();
        });
    });

    it('should work with stream API', function(done) {
        var data = '00714cam a2200205 a 45000010009000000050017000090080041000260200015000670200022000820400018001041000021001222450034001432500012001772600067001893000021002565200175002776500013004526500023004656500020004881288337620030616111422.0020805s2002    nyu    j      000 1 eng    a0786808772  a0786816155 (pbk.)  aDLCcDLCdDLC1 aChabon, Michael.10aSummerland /cMichael Chabon.  a1st ed.  aNew York :bMiramax Books/Hyperion Books for Children,cc2002.  a500 p. ;c22 cm.  aEthan Feld, the worst baseball player in the history of the game, finds himself recruited by a 100-year-old scout to help a band of fairies triumph over an ancient enemy. 1aFantasy. 1aBaseballvFiction. 1aMagicvFiction.;'
        var ms = parse({objectMode: true});

        var count = 0;
        ms.on('data', function (record) {
            count += 1;
        });

        ms.on('error', function (error) {
            console.log("error: ", error);
        });

        ms.on('end', function () {
            expect(count).equal(1);
            done();
        });

        ms.write(data);
        ms.end();
    })
});
