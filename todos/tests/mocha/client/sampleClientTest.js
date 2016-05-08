if (!(typeof MochaWeb === 'undefined')) {
    MochaWeb.testOnly(function () {
        describe("A group of tests", function () {
            it("should respect equality", function () {
                chai.assert.equal(5, 6);
            });
        });
    });
}
