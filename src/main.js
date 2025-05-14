document.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            console.log(tabs[0].id);
            console.log(tabs[0].windowId);
            chrome.storage.local.set({
                activeTabId: tabs[0].id,
                activeWindowId: tabs[0].windowId
            });
        }
    });

    const presetItems = document.getElementById('presetItems');

    function updatePresetList() {
        chrome.storage.local.get('userPresets', function(data) {
            presetItems.innerHTML = '';
            if (data.userPresets && data.userPresets.length > 0) {
                data.userPresets.forEach((preset, index) => {
                    const li = document.createElement('li');
                    li.classList.add('preset');

                    const presetContainer = document.createElement('div');
                    presetContainer.classList.add('presetContainer');

                    const presetText = document.createElement('span');
                    presetText.textContent = preset.presetName;
                    presetText.classList.add('presetText');
                    presetContainer.appendChild(presetText);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('deleteButton');
                    deleteButton.addEventListener('click', function () {
                        removePreset(index);
                    });
                    presetContainer.appendChild(deleteButton);

                    const switchLabel = document.createElement('label');
                    const switchInput = document.createElement('input');
                    switchInput.type = 'checkBox';
                    switchInput.classList.add('onOffSwitch');
                    switchInput.checked = preset.isActive || false; 
                    switchInput.addEventListener('change', function() {
                        togglePresetStatus(index, switchInput.checked);
                    });
                    switchLabel.appendChild(switchInput);
                    presetContainer.appendChild(switchLabel);

                    li.appendChild(presetContainer);
                    presetItems.appendChild(li);
                });
            } else {
                presetItems.innerHTML = '<li>No presets available</li>';
            }
        });
    }
    function removePreset(index) {
        chrome.storage.local.get('userPresets', function(data) {
            if (data.userPresets) {
                data.userPresets.splice(index, 1);
                chrome.storage.local.set({ userPresets: data.userPresets }, function() {
                    updatePresetList();
            });
            }
        });
    }
    function togglePresetStatus (index, isActive) {
        chrome.storage.local.get('userPresets', function(data) {
            data.userPresets[index].isActive = isActive; 
            chrome.storage.local.set({ userPresets: data.userPresets }, function() {
                console.log(`Preset ${index + 1} is now ${isActive ? 'active' : 'inactive'}`);
            });
        })
    }


    updatePresetList();
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.userPresets) {
            updatePresetList();
        }
    });
    
    const log = document.getElementById("log");
    log.textContent = "loaded";
    const colorWheel = document.getElementById("colorWheelImage");
    const invertButton = document.getElementById("invertButton");
    const resetButton = document.getElementById("resetButton");
    const fonts = document.getElementsByClassName("fontButton"); 
    const advancedButton = document.getElementById("advancedButton");
    const caseButton = document.getElementById("caseButton");
    const sizeButton = document.getElementById("sizeButton");
    const zapButton = document.getElementById("zapButton");
    const codeButton = document.getElementById("codeButton");
    const shareButton = document.getElementById("shareButton");
    const fileInput = document.getElementById("fileUploader");
    const loadButton = document.getElementById("loadButton");
    const saveButton = document.getElementById("saveButton");
    const clearButton = document.getElementById("clearButton");
    const presetNameField = document.getElementById("presetNameField");

    colorWheel.addEventListener("click", function(event) {
        log.textContent = "Color wheel clicked";
        const color = getColorAtPosition(event.offsetX, event.offsetY, colorWheel);
        log.textContent = "Selected color:" + color;
        chrome.runtime.sendMessage({ action: 'changeColor', color: color });
    });
    
    invertButton.addEventListener("click", function() {
        log.textContent = "Invert button clicked";
        chrome.runtime.sendMessage({ action: 'invertColor'});
    });
    
    resetButton.addEventListener("click", function() {
        log.textContent = "Reset button clicked";
        chrome.runtime.sendMessage({ action: 'reset'});
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

    let advancedPopup = null; 

    advancedButton.addEventListener("click", function() {
        log.textContent = "Advanced button clicked";
        if (!advancedPopup || advancedPopup.closed) {
            advancedPopup = window.open('advanced.html', 'AdvancedOptions', 'width=700,height=200');
        } else {
            advancedPopup.focus();
        }
        
    });

    sizeButton.addEventListener("click", function() {
        log.textContent = "Size button clicked";
        chrome.runtime.sendMessage({ action: 'changeSize'});
    });

    caseButton.addEventListener("click", function() {
        log.textContent = "Case button clicked";
        chrome.runtime.sendMessage({ action: 'changeCase'});
    });

    zapButton.addEventListener("click", function() {
        log.textContent = "Zap button clicked";
        chrome.runtime.sendMessage({ action: 'zap'});
    });

    let codePopup = null; 

    codeButton.addEventListener("click", function() {
        log.textContent = "Code button clicked";
        if (!codePopup || codePopup.closed) {
            codePopup = window.open('code.html', 'CodeEditor', 'width=600,height=800');
        } else {
            codePopup.focus();
        }
    });

    shareButton.addEventListener("click", function() {
        log.textContent = "Share button clicked";
        chrome.runtime.sendMessage({ action: 'share'});
    });

    loadButton.addEventListener("click", function() {
        if (fileInput.files.length === 0) {
            log.textContent = "No file selected.";
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                log.textContent = "JSON Loaded Successfully: " + JSON.stringify(jsonData, null, 2);
                chrome.runtime.sendMessage({ action: "load", data: jsonData });
            } catch (errror) {
                log.textContent = "Couldn't load";
            }
        }

        reader.readAsText(file);
    });

    saveButton.addEventListener("click", function() {
        log.textContent = "Save button clicked";
        chrome.runtime.sendMessage({ action: 'save', name: presetNameField.value});
    });

    clearButton.addEventListener("click", function() {
        log.textContent = "Clear button clicked";
        chrome.runtime.sendMessage({ action: 'clear'});
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
