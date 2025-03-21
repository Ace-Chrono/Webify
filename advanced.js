document.addEventListener("DOMContentLoaded", function() {
    const contrastBar = document.getElementById("contrast_slider");
    const brightnessBar = document.getElementById("brightness_slider");
    const saturationBar = document.getElementById("saturation_slider");

    function loadSettings() {
        chrome.storage.local.get(["contrast", "brightness", "saturation"], function (data) {
            contrastBar.value = data.contrast || 100;
            brightnessBar.value = data.brightness || 100;
            saturationBar.value = data.saturation || 100;
        });
    }

    function saveSettings() {
        chrome.storage.local.set({
            contrast: contrastBar.value,
            brightness: brightnessBar.value,
            saturation: saturationBar.value
        });
    }

    loadSettings();
    
    contrastBar.addEventListener("input", saveSettings);
    brightnessBar.addEventListener("input", saveSettings);
    saturationBar.addEventListener("input", saveSettings);

    contrastBar.addEventListener('input', function(event) {
        const currentValue = contrastBar.value;
        chrome.runtime.sendMessage({ action: 'changeContrast', amount: currentValue});
    });
    brightnessBar.addEventListener('input', function(event) {
        const currentValue = brightnessBar.value;
        chrome.runtime.sendMessage({ action: 'changeBrightness', amount: currentValue});
    });
    saturationBar.addEventListener('input', function(event) {
        const currentValue = saturationBar.value;
        chrome.runtime.sendMessage({ action: 'changeSaturation', amount: currentValue});
    });
});