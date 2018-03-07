var Record = require('../../lib/marc/record');
var DataField = require('../../lib/marc/data_field');

describe('Record', function () {
    var record;
    var df;

    beforeEach(function () {
        record = new Record();
        df = new DataField();
        df.tag = '100';
        var s = '01\x1faNew York (N.Y.)\x1fvFiction.';
        df.unmarshal(s);
    });

    it('should assign leader', function () {
        record.leader = '00307nam a2200085Ia 45e0';
        expect(record.leader).equal('00307nam a2200085Ia 45e0');
    });

    it('should add a variable field', function() {
        record.addVariableField(df);
        expect(record.dataFields.length).equal(1);
    });

    it('should find the first 100 subfield', function() {
        record.addVariableField(df);

        expect(record.findDataFields('100').length).equal(1);
        expect(record.findDataField('100')).not.to.be.an('undefined');
    });
});