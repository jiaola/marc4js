var Record = require('../../lib/marc/record');

describe('Record', function () {
    var record;

    before(function () {
        record = new Record();
    });

    it('should assign leader', function () {
        record.leader = '00307nam a2200085Ia 45e0';
        expect(record.leader).equal('00307nam a2200085Ia 45e0');
    });
});