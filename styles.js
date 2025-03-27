function updatePageColors(baseColor, newBaseColor) { //Filters through all the elements in the active tab and assigns any elements with the baseColor to the newBaseColor
    document.querySelectorAll('*').forEach((el) => {
        if (shouldSkipElement(el)) return;

        const styles = getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;

        if (isValidColor(bgColor) && colorsMatch(bgColor, baseColor)) {
            el.style.backgroundColor = newBaseColor;
        }
        if (isValidColor(textColor) && colorsMatch(textColor, baseColor)) {
            el.style.color = newBaseColor;
        }
    });
}

//updatePageColors Helper Functions
//____________________________________________________________________________________________________

function extractColorsCategorized() { //Extracts the main colors in the page and sorts them into either foreground or background colors. 
    const foregroundAreas = new Map();
    const backgroundAreas = new Map();

    document.querySelectorAll('*').forEach((el) => {
        if (shouldSkipElement(el)) return;

        const styles = getComputedStyle(el);
        const fgColor = styles.color;
        const bgColor = styles.backgroundColor;

        // Calculate element area (exclude elements with zero size)
        const area = el.offsetWidth * el.offsetHeight;
        if (area <= 0) return;

        // Creates mappings with the color and the total area of all elements with the color
        if (isValidColor(fgColor)) {
            foregroundAreas.set(fgColor, (foregroundAreas.get(fgColor) || 0) + area);
        }
        if (isValidColor(bgColor)) {
            backgroundAreas.set(bgColor, (backgroundAreas.get(bgColor) || 0) + area);
        }
    });

    // Convert maps to sorted arrays based on the amount of area that each color covers
    const foreground = [...foregroundAreas.entries()]
        .sort((a, b) => b[1] - a[1]) // a, b refer to any element and a[1] for example is the area, subtracting sorts by area descending
        .map(entry => entry[0]);

    const background = [...backgroundAreas.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    return { foreground, background };
}

function darkenColor(color, amount) {
    let [r, g, b] = hexToRgb(color);
    r = Math.max(0, Math.round(r * ((100-amount)/100)));
    g = Math.max(0, Math.round(g * ((100-amount)/100)));
    b = Math.max(0, Math.round(b * ((100-amount)/100)));

    return `rgb(${r}, ${g}, ${b})`;
}

function isValidColor(color) { //Checks if the color is new and rgb
    const excludedValues = ['inherit', 'initial', 'none'];
    return !excludedValues.includes(color) && (color.startsWith("rgb") || color.startsWith("#"));
}

function shouldSkipElement(el) { //Skips elements that dont display color and or are hidden.
    const ignoredTags = ['SCRIPT', 'LINK', 'META', 'STYLE', 'SVG', 'PATH', 'NOSCRIPT', 'IMG'];
    if (ignoredTags.includes(el.tagName)) return true;
    
    const styles = getComputedStyle(el);
    return styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0' || isFullyTransparent(styles.color) || isFullyTransparent(styles.backgroundColor);
}

function isFullyTransparent(color) { //Checks if a color is transparent at all
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/);
    return rgbaMatch && rgbaMatch[4] !== undefined && parseFloat(rgbaMatch[4]) < 1;
}

function colorsMatch(color1, color2) { //Checks if two colors match
    return normalizeColor(color1) === normalizeColor(color2);
}

function normalizeColor(color) { //Changes any valid CSS color string like "red" and "#ff0000" to an RGB Format.
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    return ctx.fillStyle;
}

function hexToRgb(hex) {
    // Remove the '#' if it exists
    hex = hex.replace(/^#/, '');

    // Convert shorthand hex to full form (e.g., #0f0 → #00ff00)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Extract the RGB values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return [r, g, b];
}

//____________________________________________________________________________________________________

function invertColor(rgb) { //Inverses the brightness of the given RGB color
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

//invertColor Helper Functions
//____________________________________________________________________________________________________

function rgbToHsl(r, g, b) { //Converts rgb to hsl
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
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

function hslToRgb(h, s, l) { //Converts hsl to rgb
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
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

//____________________________________________________________________________________________________

function findElementsWithText(rootNode) { //Finds all the elements in the tab with text
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

function getInitialFonts(rootNode) { //Finds all the elements in the tab with text
    // Get all elements in the document
    const allElements = rootNode.querySelectorAll('*');
    const originalFonts = [];

    // Loop through each element
    allElements.forEach(element => {
        // Check if the element has any text nodes that are not empty or just whitespace
        const hasText = Array.from(element.childNodes).some(node => {
            return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '';
        });

        // If the element has text, add it to the results array
        if (hasText) {
            originalFonts.push(element.style.fontFamily);
        }
    });

    return originalFonts;
}


let zapMode = false; 
let lastElement = null;
const originalStyle = {};
let zappedElements = []; 
let zappedElementsID = []; 

function zapElement(event) { //Removes an element from the tab
    if (zapMode) {
        removeHighlight(event);
        document.removeEventListener('mouseover', highlightElement);
        document.removeEventListener('mouseout', removeHighlight);
        document.removeEventListener('click', zapElement);
        zapMode = false; // Stop zapping after one element
        zappedElements.push({ element: event.target, displayStyle: event.target.style.display});
        let identifier;
        if (event.target.id) {
            identifier = `ID: ${event.target.id}`;
        } else if (event.target.className) {
            identifier = `Class: ${event.target.className}`;
        } else {
            identifier = `Tag: ${event.target.tagName}`;
        }
        zappedElementsID.push(identifier);
        event.target.style.display = 'none';
    }
}

//zapElement Helper Functions
//____________________________________________________________________________________________________

function highlightElement(event) { //Creates a red highlight around the element being hovered over by the cursor
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

function removeHighlight(event) { //Removes the highlighting if you are not in the Zap mode
    if (zapMode && lastElement) {
        // Restore the original style when the mouse leaves the element
        lastElement.style.outline = originalStyle.outline;
        lastElement.style.cursor = originalStyle.cursor;
        lastElement = null;
    }
}

//____________________________________________________________________________________________________

function generateCSS() {
    return cssChanges
        .map(change => `${change.selector} { ${change.property}: ${change.value} !important; }`)
        .join('\n');
}

//Main code section
//____________________________________________________________________________________________________

let previousCategorizedColors = null; 
let previousBackgroundColors = null; 
let newCategorizedColors = null;
let newBackgroundColors = null;
let initialCategorizedColors = null; 
let initialBackgroundColors = null; 
let currentUrl = null; 
let lastChangeTime = null;
let currentTime = null;
let timeSinceLastChange = currentTime - lastChangeTime;

window.onload = function () { //Checks if there are any user settings and automatically applies it when the page loads
    previousCategorizedColors = extractColorsCategorized();
    previousBackgroundColors = [...previousCategorizedColors.background.slice(0, 3)].sort();
    currentUrl = window.location.href; 
    lastChangeTime = performance.now();
    resetNoChangeTimer();

    let observer = new MutationObserver(() => {
        newCategorizedColors = extractColorsCategorized();
        newBackgroundColors = [...newCategorizedColors.background.slice(0, 3)].sort();
        if (JSON.stringify(previousBackgroundColors) !== JSON.stringify(newBackgroundColors)) {
            previousCategorizedColors = newCategorizedColors;
            previousBackgroundColors = newBackgroundColors;
            currentTime = performance.now();
            timeSinceLastChange = currentTime - lastChangeTime;
            console.log(`Time since last color update: ${timeSinceLastChange.toFixed(2)} ms`);
            lastChangeTime = currentTime;

            resetNoChangeTimer();
        }
    });

    function startObserver() {
        if (observer) observer.disconnect(); // Ensure the previous observer is removed
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Function to detect URL changes in SPAs and restart the observer
    function checkUrlChange() {
        if (window.location.href !== currentUrl) {
            console.log("Page changed:", window.location.href);
            currentUrl = window.location.href;
            handleNoChange()
            startObserver(); // Restart observer on new page
        }
    }

    // Observe DOM changes
    startObserver();

    // Periodically check for URL changes in SPAs
    setInterval(checkUrlChange, 1000);

    // Listen for back/forward navigation
    window.addEventListener("popstate", checkUrlChange);

    setTimeout(() => observer.disconnect(), 30000);
};

//Helper Functions for Initial Page Load
//____________________________________________________________________________________________________

let previousUserBackgroundColors = null; 

function handleNoChange() {
    if (!initialCategorizedColors) {
        initialCategorizedColors = previousCategorizedColors; 
        initialBackgroundColors = [...initialCategorizedColors.background.slice(0, 3)].sort();
        previousUserBackgroundColors = initialBackgroundColors;
        console.log("Initial colors: " + initialCategorizedColors.background);
        console.log("Initial colors: " + initialBackgroundColors);
    }
    updatePageColors(initialBackgroundColors[0], previousUserBackgroundColors[0]);
    updatePageColors(initialBackgroundColors[1], previousUserBackgroundColors[1]);
    updatePageColors(initialBackgroundColors[2], previousUserBackgroundColors[2]);
}

let noChangeTimer = null;
let initialRunCompleted = false;

function resetNoChangeTimer() {
    if (noChangeTimer) {
        clearTimeout(noChangeTimer);
    }

    if (!initialRunCompleted) {
        // Initial 1.5-second delay
        noChangeTimer = setTimeout(() => {
            handleNoChange();
            initialRunCompleted = true; // Mark initial run as done
        }, 1500);
    } else {
        // Instant run after initial
        handleNoChange();
    }
}

//____________________________________________________________________________________________________

let newUserBackgroundColors = null;
let elementsWithText = [];
let originalFonts = []; 
let currentFont = null; 
let currentContrast = 100;
let currentBrightness = 100;
let currentSaturation = 100;
let zoomedIn = false; 
let currentCase = "normal"; 

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { //Checks for any edits to the page made by the user and applies them
    /*if (message.action === 'storeTabId') { //Gets the Id of the current tab and stores it in the local chrome storage
        chrome.storage.local.set({ activeTabId: sender.tab.id });
    }*/
    if (message.action === 'changeColor') { //Changes the background color of the tab
        newUserBackgroundColors = [darkenColor(message.color, 40), darkenColor(message.color, 20), darkenColor(message.color, 0)];

        updatePageColors(previousUserBackgroundColors[0], newUserBackgroundColors[0]);
        updatePageColors(previousUserBackgroundColors[1], newUserBackgroundColors[1]);
        updatePageColors(previousUserBackgroundColors[2], newUserBackgroundColors[2]);

        previousUserBackgroundColors = newUserBackgroundColors; 
    }

    if (message.action === 'invertColor') { //Inverts the brightness of the background color of the tab
        newUserBackgroundColors = [invertColor(previousUserBackgroundColors[0]), invertColor(previousUserBackgroundColors[1]), invertColor(previousUserBackgroundColors[2])];

        updatePageColors(previousUserBackgroundColors[0], newUserBackgroundColors[0]);
        updatePageColors(previousUserBackgroundColors[1], newUserBackgroundColors[1]);
        updatePageColors(previousUserBackgroundColors[2], newUserBackgroundColors[2]);

        previousUserBackgroundColors = newUserBackgroundColors; 
    }

    if (message.action === 'reset') { //Resets and color changes made by the user
        updatePageColors(previousUserBackgroundColors[0], initialBackgroundColors[0]);
        updatePageColors(previousUserBackgroundColors[1], initialBackgroundColors[1]);
        updatePageColors(previousUserBackgroundColors[2], initialBackgroundColors[2]);

        previousUserBackgroundColors = initialBackgroundColors;

        for (let i = 0; i < elementsWithText.length; i++) {
            elementsWithText[i].style.fontFamily = originalFonts[i];
        }

        currentContrast = 100;
        currentBrightness = 100;
        currentSaturation = 100;
        document.documentElement.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
        `;

        for (let i = 0; zappedElements.length; i++) {
            zappedElements[i].element.style.display = zappedElements[i].displayStyle;
        }

        if (zoomedIn == true){
            document.body.style.zoom = 100 + '%';
            zoomedIn = false;
        }

        if (currentCase !== 'normal') {
            for (let i = 0; i < elementsWithText.length; i++) {
                elementsWithText[i].style.textTransform = 'none';
            }
            currentCase = 'normal';
        }
    }

    if (message.action === 'changeFont') { //Changes the font of all the text in the tab
        if (elementsWithText.length == 0){
            elementsWithText = findElementsWithText(document);
            originalFonts = getInitialFonts(document);
        }
        for (let i = 0; i < elementsWithText.length; i++) {
            elementsWithText[i].style.fontFamily = message.font;
        }
        currentFont = message.font;
    }

    if (message.action === 'changeContrast') { //Changes the contrast of the tab
        console.log("Contrast: " + message.amount)
        currentContrast = message.amount;
        document.documentElement.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
    `;
    }

    if (message.action === 'changeBrightness') { //Changes the brightness of the tab
        console.log("Brightness: " + message.amount)
        currentBrightness = message.amount;
        document.documentElement.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
    `;
    }

    if (message.action === 'changeSaturation') { //Changes the saturation of the tab
        console.log("Saturation: " + message.amount)
        currentSaturation = message.amount;
        document.documentElement.style.filter = `
        contrast(${currentContrast}%)
        brightness(${currentBrightness}%)
        saturate(${currentSaturation}%)
    `;
    }

    if (message.action === 'changeSize') { //Changes how zoomed in the document is
        if (zoomedIn == false){
            document.body.style.zoom = 150 + '%';
            zoomedIn = true;
        }
        else if (zoomedIn == true){
            document.body.style.zoom = 100 + '%';
            zoomedIn = false;
        }
    }

    if (message.action === 'changeCase') { //Changes the case of all the text in the tab
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

    if (message.action === 'zap') { //Allows the user to enable zap mode to remove elements from the tab
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

    if (message.action === 'share') { //Saves changes by the user to create a website profile
        const settings = {
            previousUserBackgroundColors,
            currentContrast,
            currentBrightness,
            currentSaturation,
            currentFont,
            zoomedIn,
            currentCase,
            zappedElementsID
        }

        console.log(settings);

        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = 'settings.json';
        link.click();
    }

    if (message.action === "injectCSS") { //Injects any css code written by the user into the tab
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

//____________________________________________________________________________________________________