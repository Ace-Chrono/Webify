document.addEventListener("DOMContentLoaded", function() {
    const cssEditor = document.getElementById("cssEditor");
    const lineNumbers = document.getElementById("lineNumbers");

    cssEditor.addEventListener("input", updateLineNumbers);

    function updateLineNumbers() {
        const lines = cssEditor.value.split("\n").length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
    }

    updateLineNumbers();

    const injectButton = document.getElementById('inject_button');

    injectButton.addEventListener('click', function(event) {
        const cssCode = document.getElementById('cssEditor').value;
        chrome.runtime.sendMessage({ action: 'injectCSS', css: cssCode});
    });
});