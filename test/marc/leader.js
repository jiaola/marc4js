var Leader = require('../../lib/marc/leader');

describe('Leader', function () {
    var leader;

    before(function () {
        leader = new Leader();
    });

    it('should unmarshal', function () {
        leader.unmarshal("00714cam a2200205 a 4500");
        expect(leader.subfieldCodeLength).equal(2);
        expect(leader.charCodingScheme).equal('a');
    });

    it('should unmarshal and marshal', function() {
        leader.unmarshal('00714cam a2200205 a 4500');
        expect(leader.marshal()).equal('00714cam a2200205 a 4500');
    });
});