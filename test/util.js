import * as Util from "../lib/util.js";

describe("Util", function () {
    it("should recognize integer with function isInt", function () {
        expect(Util.isInt(1234)).to.be.true();
        expect(Util.isInt("1234")).to.be.true();
        expect(Util.isInt(12.34)).to.be.false();
        expect(Util.isInt("12.34")).to.be.false();
        expect(Util.isInt(undefined)).to.be.false();
        expect(Util.isInt(null)).to.be.false();
        expect(Util.isInt("")).to.be.false();
    });

    it("should format integer", function () {
        expect(Util.formatInteger(23, 5)).equal("00023");
    });
});
