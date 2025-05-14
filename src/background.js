chrome.tabs.onCreated.addListener(() => {
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

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
    console.log("Tab activated:", tabId, windowId);
    chrome.storage.local.get(["activeTabId", "activeWindowId"], (data) => {
        console.log("Stored active tab/window:", data);
        if (tabId !== data.activeTabId && windowId === data.activeWindowId) {
            console.log("Sending closePopups");
            chrome.runtime.sendMessage({ action: "closePopups" });
        }
    });
});

chrome.tabs.onRemoved.addListener((tabId) => {
    console.log("Tab removed:", tabId);
    chrome.storage.local.get(["activeTabId"], ({ activeTabId }) => {
        if (tabId === activeTabId) {
            console.log("Sending closePopups from removal");
            chrome.runtime.sendMessage({ action: "closePopups" });
        }
    });
});

chrome.runtime.onMessage.addListener(function(message,) { //Sends the message to the active tab
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
    if (message.action === 'share') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'share'});
        });
    }
    if (message.action === 'load') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'load', data: message.data});
        });
    }
    if (message.action === 'save') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'save', name: message.name});
        });
    }
    if (message.action === 'clear') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'clear'});
        });
    }
});