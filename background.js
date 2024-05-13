chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'changeColor') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'changeColor', color: message.color });
        });
    }
});