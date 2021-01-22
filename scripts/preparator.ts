function splitAt(element: HTMLElement, parent: HTMLElement, pos: number, postInsertRange?: Range) {
    const clone = element.cloneNode(true) as HTMLElement;
    if (!postInsertRange) {
        clone.innerText = element.innerText.slice(0, pos);
        parent.insertBefore(clone, element);
        element.innerText = element.innerText.slice(pos);
    } else {
        clone.innerText = element.innerText.slice(pos);
        parent.insertBefore(clone, element.nextSibling);
        element.innerText = element.innerText.slice(0, pos);
        postInsertRange.setEnd(clone, 0);
    }
}

function isCuttingStart(offset: number, start: HTMLElement) {
    return (offset == 0) || (offset == start.innerText.length);
}

function isCuttingEnd(offset: number, end: HTMLElement) {
    return (offset == 0) || (offset == end.innerText.length);
}

function isThisStart(node: Element, start: HTMLElement, offset: number) {
    return (node.isEqualNode(start)) && (offset != start.innerText.length);
}

function isThisEnd(node: Element, start: HTMLElement, offset: number) {
    return (node.isEqualNode(start)) && (offset != 0);
}



function getTargetSpan(node: Node): HTMLElement {
    if (node.nodeType == Node.TEXT_NODE) return node.parentElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLElement;
}



enum FormattingType {
    FOR_COLOR = 'for',
    BACK_COLOR = 'back',
    THICKNESS = 'sty',
    BLINKING = 'blink',
    CROSSED = 'cross',
    UNDERCROSSED = 'under',
    ITALIC = 'ita'
}

interface Formatting {
    type: FormattingType;
    value: string | boolean;
}

function changeClass(elem: Element, cls: string, val: string): void {
    for (const cls of elem.classList) if (cls.startsWith(cls)) {
        elem.classList.replace(cls, val);
        return;
    }
    elem.classList.add(val);
}

function change(format: Formatting): void {
    const sel = document.getSelection();
    const range = sel.getRangeAt(0);
    const firstElem = getTargetSpan(range.startContainer);
    const lastElem = getTargetSpan(range.endContainer);
    let parent: HTMLElement;

    if (firstElem.isSameNode(lastElem)) {
        parent = firstElem.parentElement as HTMLElement;
        const finalOffset = range.endOffset - range.startOffset;
        if (!isCuttingStart(range.startOffset, firstElem)) splitAt(firstElem, parent, range.startOffset);
        if (!isCuttingEnd(finalOffset, lastElem)) splitAt(lastElem, parent, finalOffset, range);
    } else {
        parent = range.commonAncestorContainer as HTMLElement;
        if (!isCuttingStart(range.startOffset, firstElem)) splitAt(firstElem, parent, range.startOffset);
        if (!isCuttingEnd(range.endOffset, lastElem)) splitAt(lastElem, parent, range.endOffset);
    }

    for (const child of parent.children) if (sel.containsNode(child) ||
            isThisStart(child, firstElem, range.startOffset) ||
            isThisEnd(child, lastElem, range.endOffset)) {
        switch (format.type) {
            case FormattingType.FOR_COLOR:
                changeClass(child, FormattingType.FOR_COLOR, format.value as string);
                break;
            case FormattingType.BACK_COLOR:
                changeClass(child, FormattingType.BACK_COLOR, format.value as string);
                break;
            case FormattingType.THICKNESS:
                changeClass(child, FormattingType.THICKNESS, format.value as string);
                break;
            case FormattingType.BLINKING:
                child.classList.toggle(FormattingType.BLINKING, format.value as boolean);
                break;
            case FormattingType.CROSSED:
                child.classList.toggle(FormattingType.CROSSED, format.value as boolean);
                break;
            case FormattingType.UNDERCROSSED:
                child.classList.toggle(FormattingType.UNDERCROSSED, format.value as boolean);
                break;
            case FormattingType.ITALIC:
                child.classList.toggle(FormattingType.ITALIC, format.value as boolean);
                break;
        }
    }
}
