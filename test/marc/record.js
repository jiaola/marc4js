var Record = require('../../lib/marc/record');

describe('Record', function () {
    var record;

    before(function () {
        record = new Record();
    });

    it('should has id 1234', function () {
        record.id = 1234;
        expect(record.id).equal(1234);
    });
});