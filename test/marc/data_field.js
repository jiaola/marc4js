var DataField = require('../../lib/marc/data_field');
var Subfield = require('../../lib/marc/subfield');

describe('DataField', function () {
    var dataField, subfield;

    before(function () {
        dataField = new DataField();
        dataField.tag = '246';

        subfield = new Subfield();
        subfield.data = 'abcd';
        subfield.code = 'a';
    });

    it('should has no subfields', function () {
        expect(dataField.subfields).empty();
        expect(dataField.findSubfields('246')).empty();
    });

    it('should find /abc/', function () {
        dataField.subfields = [subfield];
        expect(dataField.find(/abc/)).equal(true);
    });

    it('should find return nil', function () {
        dataField.subfields = [];
        expect(dataField.findSubfield('a')).to.be.an('undefined');
    });

    it('should unmarshal a string', function () {
        var df = new DataField();
        var s = '01\x1faNew York (N.Y.)\x1fvFiction.';
        df.unmarshal(s);
        expect(df.subfields[0].data).equal('New York (N.Y.)');
        expect(df.subfields[1].code).equal('v');
    });

    it('should unmarshal a string and mashal it back', function () {
        var df = new DataField();
        var s = '01\x1faNew York (N.Y.)\x1fvFiction.';
        df.unmarshal(s);
        expect(df.marshal().length).equal(s.length);
        //expect(df.marshal().toString()).equal(s);
    });

    it('should create a valid data field with constructor', function() {
        var df = new DataField("245", "0", "1", [['a', 'New York (N.Y.)'], ['v', 'Fiction.']]);
        expect(df.indicator1).equal('0');
        expect(df.subfields[0].code).equal('a');
        expect(df.subfields[1].data).equal('Fiction.');
    });

    it('it should marshal to a string', function() {
        var df = new DataField("245", "0", "1", [['a', 'New York (N.Y.)'], ['v', 'Fiction.']]);
        expect(df.marshal().length).equal('01\x1faNew York (N.Y.)\x1fvFiction.'.length);
        expect(df.marshal()).equal('01\x1faNew York (N.Y.)\x1fvFiction.');
    })


});
