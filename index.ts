export default function stringify(obj: any, indent = 2) {
    return stringifyMember(obj, indent).string;
}

function stringifyMember(obj: any, indent: number) {
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

function stringifyArray(array: Array<any>, indent: number) {
    const bodystrs: string[] = [];
    let hasComplexItem = false;
    let previousResult: { complex: boolean };

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

function stringifyObject(obj: any, indent: number) {
    const bodystrs: string[] = [];
    let previousResult: { complex: boolean };

    const simpleMembers = new Map<string, string>();
    const complexMembers = new Map<string, string>();

    // Insert linebreak after opening bracket only if there is a complex item
    // Fields can be reordered
    for (const field in obj) {
        const result = stringifyMember(obj[field], indent);
        (result.complex ? complexMembers : simpleMembers).set(field, result.string);
    }
    for (const entry of simpleMembers) {
        insertSeparator(bodystrs, previousResult, false);
        bodystrs.push(`${entry[0]}: ${entry[1]}`);
        previousResult = { complex: false };
    }
    for (const entry of complexMembers) {
        insertSeparator(bodystrs, previousResult, true);
        bodystrs.push(`${entry[0]}: ${entry[1]}`);
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

function isComplex(member: any) {
    return member && (Array.isArray(member) || typeof member === "object");
}

function insertSeparator(bodystrs: string[], previousResult: { complex: boolean }, currentItemIsComplex: boolean) {
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

function indentLines(text: string, indent: number) {
    const lines = text.split("\n");
    const indentation = new Array(indent).fill(' ').join('');
    return lines.map(line => indentation + line).join('\n');
}
