export default function stringify(obj: any, indent = 2) {
    return stringifyMember(obj, indent).string;
}

interface Member {
    complex: boolean;
    string: string;
}

function stringifyMember(obj: any, indent: number): Member {
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
    let hasSingleLineComplexItem = false;
    let previousResult: Member;
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

    if (!hasSingleLineComplexItem) {
        return `[${bodystrs.join('')}]`;
    }
    else {
        return `[\n${indentLines(bodystrs.join(''), indent)}\n]`;
    }
    
    function insertSeparator(isCurrentItemSingleLineComplex: boolean) {
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

    function isSingleLineComplex(item: Member) {
        return item.complex && !item.string.includes("\n")
    }
}

function stringifyObject(obj: any, indent: number) {
    const bodystrs: string[] = [];
    let previousResult: Member;

    const simpleMembers = new Map<string, Member>();
    const complexMembers = new Map<string, Member>();

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
    
    function insertSeparator(currentItemIsComplex: boolean) {
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

function isComplex(member: any) {
    if (!member) {
        return false;
    }
    if (Array.isArray(member)) {
        return member.length > 0
    }
    if (typeof member === "object") {
        return [...Object.keys(member)].length > 0;
    }
    return false;
}

function indentLines(text: string, indent: number) {
    const lines = text.split("\n");
    const indentation = new Array(indent).fill(' ').join('');
    return lines.map(line => indentation + line).join('\n');
}
