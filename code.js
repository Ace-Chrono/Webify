document.addEventListener("DOMContentLoaded", function() {
    const injectButton = document.getElementById('inject_button');

    injectButton.addEventListener('click', function(event) {
        const cssCode = document.getElementById('cssEditor').value;
        chrome.runtime.sendMessage({ action: 'injectCSS', css: cssCode});
    });
});