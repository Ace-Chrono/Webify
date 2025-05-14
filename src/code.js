import { css } from '@codemirror/lang-css';
import { basicSetup, EditorView } from 'codemirror';

document.addEventListener("DOMContentLoaded", function() {
    const initialText = 'body { background-color: #f0f0f0 !important; }';
    const targetElement = document.getElementById("cssEditor");

    const editorView = new EditorView({
    doc: initialText,
    extensions: [
        basicSetup,
        css(), // Use the CSS language extension
    ],
    parent: targetElement,
    });

    /*
    const cssEditor = document.getElementById("cssEditor");
    const lineNumbers = document.getElementById("lineNumbers");

    cssEditor.addEventListener("input", updateLineNumbers);

    function updateLineNumbers() {
        const lines = cssEditor.value.split("\n").length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
    }

    updateLineNumbers();
    */

    const injectButton = document.getElementById('inject_button');

    injectButton.addEventListener('click', function() {
        const cssCode = editorView.state.doc.toString();
        console.log(cssCode);
        chrome.runtime.sendMessage({ action: 'injectCSS', css: cssCode});
    });

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "closePopups") {
            window.close(); 
        }
    });
});