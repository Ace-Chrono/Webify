document.addEventListener("DOMContentLoaded", function() {
    const log = document.getElementById("log");
    log.textContent = "loaded";
    const colorWheel = document.getElementById("color_wheel");
  
    colorWheel.addEventListener("click", function(event) {
        log.textContent = "clicked";
        const color = getColorAtPosition(event.offsetX, event.offsetY, colorWheel);
        log.textContent = "Selected color:" + color;
    });
  
    function getColorAtPosition(x, y, element) {
        const ctx = document.createElement("canvas").getContext("2d");
        const width = ctx.canvas.width = element.offsetWidth;
        const height = ctx.canvas.height = element.offsetHeight;

        // Recreate the conic gradient in the canvas
        const gradient = ctx.createConicGradient(width / 2, height / 2, 0);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(1 / 6, 'orange');
        gradient.addColorStop(2 / 6, 'yellow');
        gradient.addColorStop(3 / 6, 'green');
        gradient.addColorStop(4 / 6, 'blue');
        gradient.addColorStop(5 / 6, 'indigo');
        gradient.addColorStop(1, 'violet');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Get the color at the specified position
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        return rgbToHex(imageData[0], imageData[1], imageData[2]);
    }
  
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  });


