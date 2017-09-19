const stringify = require("../index.js").default;
const chai = require("chai");

describe("single objects", () => {
    it("should be undefined", () => {
        chai.expect(stringify(undefined)).to.equal(undefined);
    })
    it('should be "null"', () => {
        chai.expect(stringify(null)).to.equal("null");
    });
    it('should be \'""\'', () => {
        chai.expect(stringify("")).to.equal('""');
    });
    it('should be "{}"', () => {
        chai.expect(stringify({})).to.equal("{}");
    });
});

describe("complex hierarchy", () => {
    it("should be single-lined when members are all simple", () => {
        chai.expect(stringify({ a: 3 })).to.equal('{ "a": 3 }');
        chai.expect(stringify([1, 2, 3])).to.equal("[1, 2, 3]");
    })
    it('should be multi-lined when one of members is complex', () => {
        chai.expect(stringify([3, []])).to.equal("[\n  3,\n  []\n]");
    });
    it('should not indent when all members are complex', () => {
        chai.expect(stringify([[],[]])).to.equal("[[],\n[]]");
    })
    it('should keep order in array', () => {
        chai.expect(stringify([1, 2, [], 3, [4], 5])).to.equal(`[
  1, 2,
  [],
  3,
  [4],
  5
]`);
    });
    it('should collect simple members in non-primitive object', () => {
        chai.expect(stringify({ a: [], b: 3, c: 3, d: [1, 2, 3, {}] })).to.equal(`{
  "b": 3, "c": 3,
  "a": [],
  "d": [
    1, 2, 3,
    {}
  ]
}`);
    });
});
