document.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            const activeTabId = tabs[0].id;
            chrome.storage.local.set({ 'activeTabId': activeTabId }, function() {
                console.log('Active tab ID saved:', activeTabId);
            });
        }
    });
    
    const log = document.getElementById("log");
    log.textContent = "loaded";
    const colorWheel = document.getElementById("wheel_image");
    const invertButton = document.getElementById("invert_button");
    const resetButton = document.getElementById("reset_button");
    const fonts = document.getElementsByClassName("tight_button"); 
    const advancedButton = document.getElementById("advanced_button");
  
    colorWheel.addEventListener("click", function(event) {
        log.textContent = "Color wheel clicked";
        const color = getColorAtPosition(event.offsetX, event.offsetY, colorWheel);
        log.textContent = "Selected color:" + color;
        chrome.runtime.sendMessage({ action: 'changeColor', color: color });
    });
    
    invertButton.addEventListener("click", function(event) {
        log.textContent = "Invert button clicked";
        chrome.runtime.sendMessage({ action: 'invertColor'});
    });
    
    resetButton.addEventListener("click", function(event) {
        log.textContent = "Reset button clicked";
        chrome.runtime.sendMessage({ action: 'resetColor'});
    });

    for (let i = 0; i < fonts.length; i++) {
        fonts[i].addEventListener("click", function(event) {
            // Get the computed style of the clicked element
            const fontFamily = window.getComputedStyle(event.target).fontFamily;
    
            log.textContent = "Font" + fontFamily;

            // Send the font family as part of the message
            chrome.runtime.sendMessage({ action: 'changeFont', font: fontFamily });
        });
    }

    advancedButton.addEventListener("click", function(event) {
        window.open('advanced.html', 'AdvancedOptions', 'width=600,height=400');
    });
  
    function getColorAtPosition(x, y, element) {
        const ctx = document.createElement("canvas").getContext("2d");
        const width = ctx.canvas.width = element.offsetWidth;
        const height = ctx.canvas.height = element.offsetHeight;

        ctx.drawImage(element, 0, 0, width, height); 

        // Get the color at the specified position
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        return rgbToHex(imageData[0], imageData[1], imageData[2]);
    }
  
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  });
