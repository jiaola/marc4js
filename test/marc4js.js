import marc4js from "../lib/marc4js.js";

describe("marc4js", function () {
    before(function () {});

    it("should assign a record with id", function () {
        var record = new marc4js.marc.Record();
        record.id = 1234;
        expect(record.id).equal(1234);
    });
});
