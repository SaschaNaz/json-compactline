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
    let hasComplexItem = false;
    let previousResult;
    // Insert linebreak after opening bracket only if there is a complex item
    // DO NOT REORDER on array
    for (const item of array) {
        const result = stringifyMember(item, indent);
        if (result.complex) {
            hasComplexItem = true;
        }
        insertSeparator(bodystrs, previousResult, result.complex);
        bodystrs.push(result.string);
        previousResult = result;
    }
    if (hasComplexItem) {
        return `[\n${indentLines(bodystrs.join(''), indent)}\n]`;
    }
    else {
        return `[${bodystrs.join('')}]`;
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
        (result.complex ? complexMembers : simpleMembers).set(field, result.string);
    }
    for (const entry of simpleMembers) {
        insertSeparator(bodystrs, previousResult, false);
        bodystrs.push(`"${entry[0]}": ${entry[1]}`);
        previousResult = { complex: false };
    }
    for (const entry of complexMembers) {
        insertSeparator(bodystrs, previousResult, true);
        bodystrs.push(`"${entry[0]}": ${entry[1]}`);
        previousResult = { complex: true };
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
}
function isComplex(member) {
    return member && (Array.isArray(member) || typeof member === "object");
}
function insertSeparator(bodystrs, previousResult, currentItemIsComplex) {
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
function indentLines(text, indent) {
    const lines = text.split("\n");
    const indentation = new Array(indent).fill(' ').join('');
    return lines.map(line => indentation + line).join('\n');
}
//# sourceMappingURL=index.js.map