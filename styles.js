console.log('Content script loaded');

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

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function invertColor(rgb) {
    // Extract the R, G, and B components from the RGB string
    let [r, g, b] = rgb.match(/\d+/g).map(Number);

    // Convert RGB to HSL
    let [h, s, l] = rgbToHsl(r, g, b);

    // Invert the lightness
    l = 100 - l;

    // Convert back to RGB
    let [newR, newG, newB] = hslToRgb(h, s, l);

    // Return the new RGB color
    return `rgb(${newR}, ${newG}, ${newB})`;
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
                    properties.push([propertyName, propertyValue]);
                }
            }
        }

        if (properties.length > 0) {
            elementsWithBackground.push({ element, properties });
        }
    });

    return elementsWithBackground;
}

function findElementsWithText(rootNode) {
    // Get all elements in the document
    const allElements = rootNode.querySelectorAll('*');
    const elementsWithText = [];

    // Loop through each element
    allElements.forEach(element => {
        // Check if the element has any text nodes that are not empty or just whitespace
        const hasText = Array.from(element.childNodes).some(node => {
            return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '';
        });

        // If the element has text, add it to the results array
        if (hasText) {
            elementsWithText.push(element);
        }
    });

    return elementsWithText;
}

let elementsWithText = []; 
let elementsWithBackground = [];
const log = document.getElementById("log");

let currentContrast = 100;  // Default values
let currentBrightness = 100;
let currentSaturation = 100;

let zoomedIn = false; 

let currentCase = "normal"; 

//Current run time: 0:04. 
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { 
    if (message.action === 'storeTabId') {
        chrome.storage.local.set({ activeTabId: sender.tab.id });
    }
    if (message.action === 'changeColor') {
        if (elementsWithBackground.length == 0){
            elementsWithBackground = findElementsWithBackgroundColor(document);
        }
        for (let i = 0; i < elementsWithBackground.length; i++) {
            for (let j = 0; j < elementsWithBackground[i].properties.length; j++) {
                elementsWithBackground[i].element.style.setProperty(elementsWithBackground[i].properties[j][0], message.color);
            }
        }
    }
    if (message.action === 'invertColor') {
        if (elementsWithBackground.length == 0){
            elementsWithBackground = findElementsWithBackgroundColor(document);
        }
        for (let i = 0; i < elementsWithBackground.length; i++) {
            for (let j = 0; j < elementsWithBackground[i].properties.length; j++) {
                elementsWithBackground[i].element.style.setProperty(elementsWithBackground[i].properties[j][0], invertColor(getComputedStyle(elementsWithBackground[i].element).getPropertyValue(elementsWithBackground[i].properties[j][0])));
            }
        }
    }
    if (message.action === 'resetColor') {
        if (elementsWithBackground.length == 0){
            elementsWithBackground = findElementsWithBackgroundColor(document);
        }
        for (let i = 0; i < elementsWithBackground.length; i++) {
            for (let j = 0; j < elementsWithBackground[i].properties.length; j++) {
                elementsWithBackground[i].element.style.setProperty(elementsWithBackground[i].properties[j][0], elementsWithBackground[i].properties[j][1]);
            }
        }
    }
    if (message.action === 'changeFont') {
        if (elementsWithText.length == 0){
            elementsWithText = findElementsWithText(document);
        }
        for (let i = 0; i < elementsWithText.length; i++) {
            elementsWithText[i].style.fontFamily = message.font;
        }
    }
    if (message.action === 'changeContrast') {
        console.log("Contrast: " + message.amount)
        currentContrast = message.amount;
        document.body.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
    `;

    }
    if (message.action === 'changeBrightness') {
        console.log("Brightness: " + message.amount)
        currentBrightness = message.amount;
        document.body.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
    `;

    }
    if (message.action === 'changeSaturation') {
        console.log("Saturation: " + message.amount)
        currentSaturation = message.amount;
        document.body.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
    `;

    }
    if (message.action === 'changeSize') {
        if (zoomedIn == false){
            document.body.style.zoom = 150 + '%';
            zoomedIn = true;
        }
        else if (zoomedIn == true){
            document.body.style.zoom = 100 + '%';
            zoomedIn = false;
        }
    }
    if (message.action === 'changeCase') {
        if (elementsWithText.length == 0) {
            elementsWithText = findElementsWithText(document);
        }
    
        if (currentCase === 'normal') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'uppercase';
            }
            currentCase = 'upper';
        } else if (currentCase === 'upper') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'lowercase';
            }
            currentCase = 'lower';
        } else if (currentCase === 'lower') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'none';
            }
            currentCase = 'normal';
        }
    }
});