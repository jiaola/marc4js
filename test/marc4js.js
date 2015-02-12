'use strict';

var marc4js = require('../lib/marc4js');

describe('marc4js', function () {
    before(function () {

    });

    it('should assign a record with id', function () {
        var record = new marc4js.marc.Record();
        record.id = 1234;
        expect(record.id).equal(1234);
    });
});