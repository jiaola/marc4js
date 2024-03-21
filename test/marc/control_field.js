import ControlField from "../../lib/marc/control_field.js";

describe("ControlField", function () {
    var cf;

    before(function () {
        cf = new ControlField();
    });

    it("should have id 1234", function () {
        cf.id = 1234;
        expect(cf.id).equal(1234);
    });

    it("should have data abcd", function () {
        cf.data = "abcd";
        expect(cf.data).equal("abcd");
    });
});
