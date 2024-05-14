function findElementsWithBackgroundColor(rootNode) {
    const elementsWithBackgroundColor = [];

    function getRGB(color) {
        color = parseInt(color.substring(1), 16);
        const r = color >> 16;
        const g = (color - (r << 16)) >> 8;
        const b = color - (r << 16) - (g << 8);
        return [r, g, b];
    }

    function isSimilar([r1, g1, b1], [r2, g2, b2]) {
        return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) < 50;
    }

    // Recursive function to traverse the DOM tree
    function traverse(node) {
        // Check if the node has a computed background color
        const computedStyle = getComputedStyle(node);
        const backgroundColor = computedStyle.backgroundColor;

        // Check if the computed background color matches the target color
        if (elementsWithBackgroundColor.length === 0 || isSimilar(getRGB(backgroundColor), getRGB(getComputedStyle(elementsWithBackgroundColor[0]).backgroundColor))) {
            elementsWithBackgroundColor.push(node);
        }

        // Continue traversal for child nodes
        for (const childNode of node.childNodes) {
            if (childNode.nodeType === Node.ELEMENT_NODE) {
                traverse(childNode);
            }
        }
    }

    // Start traversal from the root node
    traverse(rootNode);

    return elementsWithBackgroundColor;
}

function changeElementBg(element, color) {
    element.style.background = color;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'changeColor') {
        const elements = findElementsWithBackgroundColor(document.body);
        for (let i = 0; i < elements.length; i++) {
            changeElementBg(elements[i], message.color);
        }
    }
});