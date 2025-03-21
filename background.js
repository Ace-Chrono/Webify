chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.local.set({
        contrast: 100,
        brightness: 100,
        saturation: 100
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        // Reset values in storage when a new page loads
        chrome.storage.local.set({
            contrast: 100,
            brightness: 100,
            saturation: 100
        });
    }
});

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
    if (message.action === 'reset') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'reset'});
        });
    }
    if (message.action === 'changeFont') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'changeFont', font: message.font});
        });
    }
    if (message.action === 'changeContrast') {
        chrome.storage.local.get('activeTabId', function(data) {
            const activeTabId = data.activeTabId;
            if (activeTabId) {
                chrome.tabs.sendMessage(activeTabId, { action: 'changeContrast', amount: message.amount });
            } else {
                console.error('No active tab ID found in storage');
            }
        });
    }
    if (message.action === 'changeBrightness') {
        chrome.storage.local.get('activeTabId', function(data) {
            const activeTabId = data.activeTabId;
            if (activeTabId) {
                chrome.tabs.sendMessage(activeTabId, { action: 'changeBrightness', amount: message.amount });
            } else {
                console.error('No active tab ID found in storage');
            }
        });
    }
    if (message.action === 'changeSaturation') {
        chrome.storage.local.get('activeTabId', function(data) {
            const activeTabId = data.activeTabId;
            if (activeTabId) {
                chrome.tabs.sendMessage(activeTabId, { action: 'changeSaturation', amount: message.amount });
            } else {
                console.error('No active tab ID found in storage');
            }
        });
    }
    if (message.action === 'changeSize') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'changeSize'});
        });
    }
    if (message.action === 'changeCase') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'changeCase'});
        });
    }
    if (message.action === 'zap') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'zap'});
        });
    }
    if (message.action === 'share') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'share'});
        });
    }
    if (message.action === 'injectCSS') {
        chrome.storage.local.get('activeTabId', function(data) {
            const activeTabId = data.activeTabId;
            if (activeTabId) {
                chrome.tabs.sendMessage(activeTabId, { action: 'injectCSS', css: message.css });
            } else {
                console.error('No active tab ID found in storage');
            }
        });
    }
});