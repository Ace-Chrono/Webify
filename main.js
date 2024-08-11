document.addEventListener("DOMContentLoaded", function() {
    const log = document.getElementById("log");
    log.textContent = "loaded";
    const colorWheel = document.getElementById("wheel_image");
    const invertButton = document.getElementById("invert_button")

    invertButton.addEventListener("click", function(event) {
        log.textContent = "Invert button clicked";
        chrome.runtime.sendMessage({ action: 'invertColor'});
    });
  
    colorWheel.addEventListener("click", function(event) {
        log.textContent = "Color wheel clicked";
        const color = getColorAtPosition(event.offsetX, event.offsetY, colorWheel);
        log.textContent = "Selected color:" + color;
        chrome.runtime.sendMessage({ action: 'changeColor', color: color });
    });
  
    function getColorAtPosition(x, y, element) {
        const ctx = document.createElement("canvas").getContext("2d");
        const width = ctx.canvas.width = element.offsetWidth;
        const height = ctx.canvas.height = element.offsetHeight;

        ctx.drawImage(element, 0, 0, width, height); 

        // Get the color at the specified position
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        return rgbToHex(imageData[0], imageData[1], imageData[2]);
    }
  
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  });
