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
    it('should be "[]"', () => {
        chai.expect(stringify([])).to.equal("[]");
    });
});

describe("complex hierarchy", () => {
    it("should be single-lined when members are all simple", () => {
        chai.expect(stringify({ a: 3 })).to.equal('{ "a": 3 }');
        chai.expect(stringify([1, 2, 3])).to.equal("[1, 2, 3]");
    });
    it("should be single-lined when the only member is single-line complex", () => {
        chai.expect(stringify([{ a: 3 }])).to.equal('[{ "a": 3 }]');
    });
    it('should be multi-lined when one of members is single-line complex', () => {
        chai.expect(stringify([3, [3]])).to.equal("[\n  3,\n  [3]\n]");
    });
    it('should not indent when all members are not single-line complex', () => {
        chai.expect(stringify([{ a: [3] }, { b: [3] }])).to.equal('[{\n  "a": [3]\n}, {\n  "b": [3]\n}]');
    });
    it('should keep order in array', () => {
        chai.expect(stringify([1, 2, [], 3, [4], 5, {}])).to.equal(`[
  1, 2, [], 3,
  [4],
  5, {}
]`);
    });
    it('should collect simple members in non-primitive object', () => {
        chai.expect(stringify({ a: [3], b: 3, c: 3, d: [[], 1, 2, 3, { c: [] }] })).to.equal(`{
  "b": 3, "c": 3,
  "a": [3],
  "d": [
    [], 1, 2, 3,
    { "c": [] }
  ]
}`);
    });
    it("should treat empty arrays and objects as simple objects", () => {
        chai.expect(stringify([[], {}])).to.equal("[[], {}]");
    });
});

describe("process unsupported members correctly", () => {
    it("should be converted to null on arrays", () => {
        chai.expect(stringify([undefined, () => {}, 3])).to.equal("[null, null, 3]");
    });
    it("should not appear as an object member", () => {
        chai.expect(stringify({ a: undefined, b: 3, c: () => {} })).to.equal('{ "b": 3 }');
    });
});