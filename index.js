"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stringify(obj, indent = 2) {
    return stringifyMember(obj, indent).string;
}
exports.default = stringify;
function stringifyMember(obj, indent) {
    if (!isComplex(obj)) {
        return {
            complex: false,
            string: JSON.stringify(obj)
        };
    }
    return {
        complex: true,
        string: (Array.isArray(obj) ? stringifyArray : stringifyObject)(obj, indent)
    };
}
function stringifyArray(array, indent) {
    const bodystrs = [];
    let hasSingleLineComplexItem = false;
    let previousResult;
    let previousResultWasSingleLineComplex = false;
    // Insert linebreak after opening bracket only if there is a complex item
    // DO NOT REORDER on array
    for (const item of array) {
        const result = stringifyMember(item, indent);
        if (result.string === undefined) {
            result.string = "null";
        }
        const isCurrentItemSingleLineComplex = isSingleLineComplex(result);
        if (isCurrentItemSingleLineComplex) {
            hasSingleLineComplexItem = true;
        }
        insertSeparator(isCurrentItemSingleLineComplex);
        bodystrs.push(result.string);
        previousResult = result;
        previousResultWasSingleLineComplex = isCurrentItemSingleLineComplex;
    }
    if (!hasSingleLineComplexItem || bodystrs.length <= 1) {
        return `[${bodystrs.join('')}]`;
    }
    else {
        return `[\n${indentLines(bodystrs.join(''), indent)}\n]`;
    }
    function insertSeparator(isCurrentItemSingleLineComplex) {
        if (!previousResult) {
            return;
        }
        // insert linebreak only when current item is single-line complex one
        if (isCurrentItemSingleLineComplex || previousResultWasSingleLineComplex) {
            bodystrs.push(",\n");
        }
        else {
            bodystrs.push(", ");
        }
    }
    function isSingleLineComplex(item) {
        return item.complex && !item.string.includes("\n");
    }
}
function stringifyObject(obj, indent) {
    const bodystrs = [];
    let previousResult;
    const simpleMembers = new Map();
    const complexMembers = new Map();
    // Insert linebreak after opening bracket only if there is a complex item
    // Fields can be reordered
    for (const field in obj) {
        const result = stringifyMember(obj[field], indent);
        if (result.string !== undefined) {
            (result.complex ? complexMembers : simpleMembers).set(field, result);
        }
    }
    for (const entry of simpleMembers) {
        insertSeparator(false);
        bodystrs.push(`"${entry[0]}": ${entry[1].string}`);
        previousResult = entry[1];
    }
    for (const entry of complexMembers) {
        insertSeparator(true);
        bodystrs.push(`"${entry[0]}": ${entry[1].string}`);
        previousResult = entry[1];
    }
    if (!simpleMembers.size && !complexMembers.size) {
        return "{}";
    }
    if (complexMembers.size) {
        return `{\n${indentLines(bodystrs.join(''), indent)}\n}`;
    }
    else {
        return `{ ${bodystrs.join('')} }`;
    }
    function insertSeparator(currentItemIsComplex) {
        if (!previousResult) {
            return;
        }
        // insert inline comma only when two items are both simple
        if (!previousResult.complex && !currentItemIsComplex) {
            bodystrs.push(", ");
        }
        else {
            bodystrs.push(",\n");
        }
    }
}
function isComplex(member) {
    if (!member) {
        return false;
    }
    if (Array.isArray(member)) {
        return member.length > 0;
    }
    if (typeof member === "object") {
        return [...Object.keys(member)].length > 0;
    }
    return false;
}
function indentLines(text, indent) {
    const lines = text.split("\n");
    const indentation = new Array(indent).fill(' ').join('');
    return lines.map(line => indentation + line).join('\n');
}
//# sourceMappingURL=index.js.map