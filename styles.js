function changeBodyBg(color){
    document.body.style.background = color;
}

// Function to change heading background color
function changeHeadingBg(color){
    document.getElementById("heading").style.background = color;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'changeColor') {
        changeBodyBg(message.color)
        changeHeadingBg(message.color)
    }
});