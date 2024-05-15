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

    var all = document.getElementsByTagName("*");

    for (var i=0, max=all.length; i < max; i++) {
        const computedStyle = getComputedStyle(all[i]);
        const backgroundColor = computedStyle.backgroundColor;

        // Check if the background color is not transparent and is similar to the first element's background color
        if (backgroundColor && !backgroundColor.includes('rgba') && (elementsWithBackgroundColor.length === 0 || isSimilar(getRGB(backgroundColor), getRGB(getComputedStyle(elementsWithBackgroundColor[0]).backgroundColor)))) {
            elementsWithBackgroundColor.push(all[i]);
        }
    }

    for (i=0; i < elementsWithBackgroundColor.length; i++)
    {
        console.log(elementsWithBackgroundColor[i]);
    }
    

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