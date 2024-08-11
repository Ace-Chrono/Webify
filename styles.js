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

function invertColor(rgb) {
    // Extract the red, green, and blue components from the rgb string
    const rgbValues = rgb.match(/\d+/g);
    const r = 255 - rgbValues[0];
    const g = 255 - rgbValues[1];
    const b = 255 - rgbValues[2];
    
    return `rgb(${r}, ${g}, ${b})`;
  }

function findElementsWithBackgroundColor(rootNode) {
    const elements = rootNode.querySelectorAll("*:not(script):not(svg):not(link)");
    const elementsWithBackground = [];
    const relevantKeywords = ["background", "content"];

    elements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const properties = [];

        for (let i = 0; i < computedStyle.length; i++) {
            const propertyName = computedStyle[i];
            const propertyValue = computedStyle.getPropertyValue(propertyName);

            if (relevantKeywords.some(keyword => propertyName.includes(keyword)) && (propertyValue.includes("rgb") || propertyValue.includes("#"))) {
                element.style.setProperty(propertyName, 'unset', 'important');
                const unsetValue = computedStyle.getPropertyValue(propertyName);

                element.style.removeProperty(propertyName); // Remove the unset property

                if (unsetValue !== propertyValue) {
                    properties.push(propertyName);
                }
            }
        }

        if (properties.length > 0) {
            elementsWithBackground.push({ element, properties });
        }
    });

    return elementsWithBackground;
}

let elementsWithBackground = [];
const log = document.getElementById("log");

//Current run time: 0:04. 
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { 
    if (message.action === 'changeColor') {
        if (elementsWithBackground.length == 0){
            elementsWithBackground = findElementsWithBackgroundColor(document);
        }
        for (let i = 0; i < elementsWithBackground.length; i++) {
            for (let j = 0; j < elementsWithBackground[i].properties.length; j++) {
                elementsWithBackground[i].element.style.setProperty(elementsWithBackground[i].properties[j], message.color);
            }
        }
    }
    if (message.action === 'invertColor') {
        if (elementsWithBackground.length == 0){
            elementsWithBackground = findElementsWithBackgroundColor(document);
        }
        for (let i = 0; i < elementsWithBackground.length; i++) {
            for (let j = 0; j < elementsWithBackground[i].properties.length; j++) {
                elementsWithBackground[i].element.style.setProperty(elementsWithBackground[i].properties[j], invertColor(getComputedStyle(elementsWithBackground[i].element).getPropertyValue(elementsWithBackground[i].properties[j])));
            }
        }
    }
});