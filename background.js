chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { //Sends the message to the active tab
    if (message.action === 'changeColor') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'changeColor', color: message.color });
        });
    }
    if (message.action === 'invertColor') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'invertColor'});
        });
    }
});