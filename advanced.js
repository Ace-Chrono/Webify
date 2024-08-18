document.addEventListener("DOMContentLoaded", function() {
    const contrastBar = document.getElementById("contrast_slider");
    const brightnessBar = document.getElementById("brightness_slider");
    const saturationBar = document.getElementById("saturation_slider");

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