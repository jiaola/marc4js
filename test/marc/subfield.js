var Subfield = require('../../lib/marc/subfield');

describe('Subfield', function () {
    var subfield;

    before(function () {
        subfield = new Subfield();
    });

    it('should has id 1234', function () {
        subfield.id = 1234;
        expect(subfield.id).equal(1234);
    });

    it('should find /abc/', function() {
        subfield.data = 'abcd';
        expect(subfield.find(/abc/)).equal(true);
    });

    it('should not find /xyz/', function() {
        subfield.data = 'abcd';
        expect(subfield.find(/xyz/)).equal(false);
    });
});