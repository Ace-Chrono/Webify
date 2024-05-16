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

function changeElementBg(element, color) {
    element.style.background = color;
}

function findElementsWithBackgroundColor(rootNode) {
    const elements = rootNode.getElementsByTagName("*");
    const elementsWithBackground = [];

    for (let i = 0; i < elements.length; i++) {
        const computedStyle = getComputedStyle(elements[i]);
        const properties = [];

        for (let j = 0; j < computedStyle.length; j++) {
            const propertyName = computedStyle.item(j);
            if ((propertyName.indexOf("background") !== -1 || propertyName.indexOf("content") !== -1) && (computedStyle.getPropertyValue(propertyName).includes("rgb") || computedStyle.getPropertyValue(propertyName).includes("#"))) {
                properties.push(propertyName);
            }
        }

        if (properties.length > 0) {
            elementsWithBackground.push({ element: elements[i], properties: properties });
        }
    }

    return elementsWithBackground;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'changeColor') {
        const elementsWithBackground = findElementsWithBackgroundColor(document);
        console.log(elementsWithBackground);
        for (let i = 0; i < elementsWithBackground.length; i++) {
            for (let j = 0; j < elementsWithBackground[i].properties.length; j++) {
                elementsWithBackground[i].element.style.setProperty(elementsWithBackground[i].properties[j], message.color);
            }
        }
    }
});