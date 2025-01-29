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

  function extractColorsFromStylesheets() {
    const colorOrigins = [];

    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules || []) {
                if (rule.style) {
                    const colorProperties = [
                        { property: 'color', value: rule.style.color },
                        { property: 'backgroundColor', value: rule.style.backgroundColor },
                        { property: 'borderColor', value: rule.style.borderColor },
                        { property: 'boxShadow', value: rule.style.boxShadow },
                    ];
                    colorProperties.forEach(({ value, property }) => {
                        if (value && isValidColor(value)) {
                            // Store the color and its origin (rule selector and property)
                            colorOrigins.push({
                                color: value,
                                source: `Rule: ${rule.selectorText} (Property: ${property})`,
                            });
                        }
                    });
                }
            }
        } catch (err) {
            console.warn(`Cannot access rules for stylesheet: ${sheet.href}`, err);
        }
    }

    return colorOrigins;
}

function extractColorsFromDOM() {
    const colorOrigins = [];

    // List of elements to exclude
    const excludedTags = ['script', 'link', 'meta', 'style', 'path', 'svg'];

    document.querySelectorAll('*').forEach((el) => {
        // Skip irrelevant elements
        if (excludedTags.includes(el.tagName.toLowerCase())) {
            return;
        }

        // Ensure the element is visible (not hidden by CSS)
        const isVisible = getComputedStyle(el).visibility !== 'hidden' &&
                          getComputedStyle(el).display !== 'none' &&
                          el.offsetWidth > 0 && el.offsetHeight > 0;

        // Only process visible elements
        if (isVisible) {
            const styles = getComputedStyle(el);
            
            // Filter out properties we don't need (like rgba(0, 0, 0, 0))
            const colorProperties = [
                { property: 'color', value: styles.color },
                { property: 'backgroundColor', value: styles.backgroundColor },
                { property: 'borderColor', value: styles.borderColor },
                { property: 'boxShadow', value: styles.boxShadow },
            ];

            colorProperties.forEach(({ value, property }) => {
                if (value && isValidColor(value)) {
                    // Store the color and its origin (element's tag and property)
                    colorOrigins.push({
                        color: value,
                        source: `Element: <${el.tagName.toLowerCase()}> (Property: ${property})`,
                    });
                }
            });
        }
    });

    return colorOrigins.filter(({ color }) => color !== 'rgba(0, 0, 0, 0)' && isValidColor(color));
}

// Helper function to validate if a string is a valid CSS color (excluding 'inherit', 'initial', 'none')
function isValidColor(color) {
    const excludedValues = ['inherit', 'initial', 'none'];
    return !excludedValues.includes(color) && (color.startsWith("rgb") || color.startsWith("#"));
}

function extractColorsCategorized() {
    const foregroundAreas = new Map();
    const backgroundAreas = new Map();

    document.querySelectorAll('*').forEach((el) => {
        if (shouldSkipElement(el)) return; // Skip invisible or non-important elements

        const styles = getComputedStyle(el);
        const textColor = styles.color;
        const bgColor = styles.backgroundColor;

        // Calculate element area (exclude elements with zero size)
        const area = el.offsetWidth * el.offsetHeight;
        if (area <= 0) return;

        // Add area to foreground color
        if (isValidColor(textColor)) {
            foregroundAreas.set(textColor, (foregroundAreas.get(textColor) || 0) + area);
        }

        // Add area to background color
        if (isValidColor(bgColor)) {
            backgroundAreas.set(bgColor, (backgroundAreas.get(bgColor) || 0) + area);
        }
    });

    // Convert maps to sorted arrays based on area coverage
    const foreground = [...foregroundAreas.entries()]
        .sort((a, b) => b[1] - a[1]) // Sort by area (descending)
        .map(entry => entry[0]);

    const background = [...backgroundAreas.entries()]
        .sort((a, b) => b[1] - a[1]) // Sort by area (descending)
        .map(entry => entry[0]);

    return { foreground, background };
}

function shouldSkipElement(el) {
    const ignoredTags = ['SCRIPT', 'LINK', 'META', 'STYLE', 'SVG', 'PATH', 'NOSCRIPT'];
    if (ignoredTags.includes(el.tagName)) return true; // Skip unnecessary elements
    
    const styles = getComputedStyle(el);
    return styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0';
}

function rgbToArray(color) {
    // Converts "rgb(255, 200, 100)" → [255, 200, 100]
    return color.match(/\d+/g).map(Number);
}

function calculateColorShift(baseColor, newColor) {
    const baseRGB = rgbToArray(baseColor);
    const newRGB = rgbToArray(newColor);

    return [
        newRGB[0] - baseRGB[0], // Red shift
        newRGB[1] - baseRGB[1], // Green shift
        newRGB[2] - baseRGB[2]  // Blue shift
    ];
}

function applyColorShift(originalColor, shift) {
    const rgb = rgbToArray(originalColor);
    
    const newRGB = rgb.map((channel, i) => {
        return Math.max(0, Math.min(255, channel + shift[i])); // Keep values in [0, 255] range
    });

    return `rgb(${newRGB[0]}, ${newRGB[1]}, ${newRGB[2]})`;
}

function updatePageColors(baseColor, newBaseColor) {
    const shift = calculateColorShift(baseColor, newBaseColor);

    document.querySelectorAll('*').forEach((el) => {
        if (shouldSkipElement(el)) return;

        const styles = getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;

        if (isValidColor(bgColor)) {
            el.style.backgroundColor = applyColorShift(bgColor, shift);
        }
        if (isValidColor(textColor)) {
            el.style.color = applyColorShift(textColor, shift);
        }
    });
}

const stylesheetColors = extractColorsFromStylesheets();
console.log('Colors from stylesheets:', stylesheetColors);

const domColors = extractColorsFromDOM();
console.log('Filtered colors from DOM:', domColors);

const categorizedColors = extractColorsCategorized();
console.log("Categorized unique colors:", categorizedColors);

const baseColor = categorizedColors.background[0];

//updatePageColors(baseColor, "rgb(0, 128, 0)");

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

let zapMode = false; 
let lastElement = null;
const originalStyle = {};

let cssChanges = [];

function addCSSChange(selector, property, value) {
    // Check if the change already exists
    const existingChangeIndex = cssChanges.findIndex(change => 
        change.selector === selector && 
        change.property === property
    );

    if (existingChangeIndex > -1) {
        // Update the existing change with the new value
        cssChanges[existingChangeIndex].value = value;
    } else {
        // Add a new change
        cssChanges.push({ selector, property, value });
    }
}

function generateCSS() {
    return cssChanges
        .map(change => `${change.selector} { ${change.property}: ${change.value} !important; }`)
        .join('\n');
}

function highlightElement(event) {
    if (zapMode) {
        // Remove highlight from the last element
        if (lastElement) {
            lastElement.style.outline = originalStyle.outline;
            lastElement.style.cursor = originalStyle.cursor;
        }

        // Save the original style of the current element
        originalStyle.outline = event.target.style.outline;
        originalStyle.cursor = event.target.style.cursor;

        // Apply highlight style
        event.target.style.outline = '2px solid red';
        event.target.style.cursor = 'pointer';

        lastElement = event.target;
    }
}

function removeHighlight(event) {
    if (zapMode && lastElement) {
        // Restore the original style when the mouse leaves the element
        lastElement.style.outline = originalStyle.outline;
        lastElement.style.cursor = originalStyle.cursor;
        lastElement = null;
    }
}

function zapElement(event) {
    if (zapMode) {
        event.target.style.display = 'none';
        zapMode = false; // Stop zapping after one element
        document.removeEventListener('mouseover', highlightElement);
        document.removeEventListener('mouseout', removeHighlight);
        document.removeEventListener('click', zapElement);
    }
}

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
                addCSSChange(`.${elementsWithBackground[i].element.classList[0]}`, elementsWithBackground[i].properties[j][0], message.color);
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
                addCSSChange(`.${elementsWithBackground[i].element.classList[0]}`, elementsWithBackground[i].properties[j][0], invertColor(getComputedStyle(elementsWithBackground[i].element).getPropertyValue(elementsWithBackground[i].properties[j][0])));
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
                addCSSChange(`.${elementsWithBackground[i].element.classList[0]}`, elementsWithBackground[i].properties[j][0], elementsWithBackground[i].properties[j][1]);
            }
        }
    }
    if (message.action === 'changeFont') {
        if (elementsWithText.length == 0){
            elementsWithText = findElementsWithText(document);
        }
        for (let i = 0; i < elementsWithText.length; i++) {
            elementsWithText[i].style.fontFamily = message.font;
            addCSSChange(`.${elementsWithText[i].classList[0]}`, 'font-family', message.font);
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
        addCSSChange('body', 'filter', document.body.style.filter);
    }
    if (message.action === 'changeBrightness') {
        console.log("Brightness: " + message.amount)
        currentBrightness = message.amount;
        document.body.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
    `;
        addCSSChange('body', 'filter', document.body.style.filter);
    }
    if (message.action === 'changeSaturation') {
        console.log("Saturation: " + message.amount)
        currentSaturation = message.amount;
        document.body.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
    `;
        addCSSChange('body', 'filter', document.body.style.filter);
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
        addCSSChange('body', 'zoom', zoomValue);
    }
    if (message.action === 'changeCase') {
        if (elementsWithText.length == 0) {
            elementsWithText = findElementsWithText(document);
        }
    
        if (currentCase === 'normal') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'uppercase';
                addCSSChange(`.${elementsWithText[i].classList[0]}`, 'text-transform', 'uppercase');
            }
            currentCase = 'upper';
        } else if (currentCase === 'upper') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'lowercase';
                addCSSChange(`.${elementsWithText[i].classList[0]}`, 'text-transform', 'lowercase');
            }
            currentCase = 'lower';
        } else if (currentCase === 'lower') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'none';
                addCSSChange(`.${elementsWithText[i].classList[0]}`, 'text-transform', 'none');
            }
            currentCase = 'normal';
        }
    }
    if (message.action === 'zap') {
        zapMode = !zapMode;
        if (zapMode) {
            document.addEventListener('mouseover', highlightElement);
            document.addEventListener('mouseout', removeHighlight);
            document.addEventListener('click', zapElement);
        }
        else {
            document.removeEventListener('mouseover', highlightElement);
            document.removeEventListener('mouseout', removeHighlight);
            document.removeEventListener('click', zapElement);
        }
    }
    if (message.action === 'share') {
        const cssContent = generateCSS();
        const blob = new Blob([cssContent], { type: 'text/css' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'styles.css';
        link.click();
    }
    if (message.action === "injectCSS") {
        test = generateCSS();
        console.log(test);
        if (message.css) {
            let styleElement = document.getElementById('injectedCSS');
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = 'injectedCSS';
                document.head.appendChild(styleElement);
            }
            styleElement.textContent = message.css;
        }
    }
});