document.addEventListener("DOMContentLoaded", function() {
    const contrastBar = document.getElementById("contrast_slider");
    const brightnessBar = document.getElementById("brightness_slider");
    const saturationBar = document.getElementById("saturation_slider");

    function loadSettings() {
        contrastBar.value = localStorage.getItem("contrast") || 100;
        brightnessBar.value = localStorage.getItem("brightness") || 100;
        saturationBar.value = localStorage.getItem("saturation") || 100;
    }

    function saveSettings() {
        localStorage.setItem("contrast", contrastBar.value);
        localStorage.setItem("brightness", brightnessBar.value);
        localStorage.setItem("saturation", saturationBar.value);
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