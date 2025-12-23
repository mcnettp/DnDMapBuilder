/* Constants */
const DEFAULT_COLOR = '#FFFFFF';
const colorChangedMap = new Map(); // Map to track colorChanged state for each square

/* Global Variables */
let isMouseDown = false;       // Flag to track whether the mouse button is currently pressed down
let pickedColor = "#000000"; // Current color picked from the color wheel
let globalHandlersAdded = false; // Ensure global mouse handlers are only added once

/* Functions */
/**
* Converts the function in Hex to the RGB value
* @param {string} hex value: #0000FF
* @returns RGB Value: rgb(0, 0, 0)
**/
function hexToRgb(hex) {
    // Get rid of the # character
    hex = hex.replace('#', '');

    // Parse the values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Return the RGB
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

/**
* Function to update the selected color from the color wheel
* @param {string} color 
**/
function updateColor(color) {
    document.getElementById('selectedColor').innerText = 'Selected Color: ' + color;
    pickedColor = color;
}

/**
* Function to Draw the Map based on the number of columns and rows
* Also handles the input for clicking to change the color
**/
function createMap() {
    const columns = parseInt(document.getElementById('columns').value);
    const rows = parseInt(document.getElementById('rows').value);
    const mapContainer = document.getElementById('grid');

    // Clear Previous Map
    mapContainer.innerHTML = '';

    // If columns/rows are not valid positive integers, mark container as empty and exit
    if (!Number.isInteger(columns) || columns <= 0 || !Number.isInteger(rows) || rows <= 0) {
        mapContainer.classList.add('empty');
        // clear grid sizing to avoid stray rendering
        mapContainer.style.gridTemplateColumns = '';
        mapContainer.style.gridTemplateRows = '';
        return;
    }
    mapContainer.classList.remove('empty');
    mapContainer.style.gridTemplateColumns = 'repeat(${columns}, 50px)';
    mapContainer.style.gridTemplateRows = 'repeat(${rows}, 50px)';

    // Clear any previous square state to avoid stale references
    colorChangedMap.clear();

    // Set Color Picker
    let selectedColor = pickedColor; // Initialize to the picked color

    // Draw by Number of Columns x Number of Rows
    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < columns; ++j) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.style.backgroundColor = DEFAULT_COLOR;
            colorChangedMap.set(square, false); // Initialize colorChangedMap to false for each new square
            
            square.addEventListener('mousedown', function() {
                // Prevent starting native drag/select operations
                window.getSelection().removeAllRanges();

                // Ensure this element is not draggable
                if (this.draggable !== false) {
                    this.draggable = false;
                }

                selectedColor = pickedColor;
                isMouseDown = true;
                const computedColor = window.getComputedStyle(this).getPropertyValue('background-color');
                const colorChanged = colorChangedMap.get(this);

                if (!colorChanged) {
                    if (computedColor === hexToRgb(selectedColor)) {
                        this.style.backgroundColor = DEFAULT_COLOR;
                    }
                    else {
                        this.style.backgroundColor = selectedColor;
                    }
                    colorChangedMap.set(this, true); // Set color changed flag to true for this square
                }
            });

            // Prevent native dragging of the square
            square.addEventListener('dragstart', function(e) {
                e.preventDefault();
            });

            // Set row and column for the square
            square.style.gridColumn = j + 1;
            square.style.gridRow = i + 1;

            mapContainer.appendChild(square);
        }
    }
    
    // Add global handlers once to avoid piling up listeners on repeated createMap() calls
    if (globalHandlersAdded === false) {
        // Add global mouse handlers
        document.addEventListener('mousemove', function(event) {
            if (isMouseDown !== false) {
                const squareUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
                selectedColor = pickedColor;
                if (squareUnderMouse && squareUnderMouse.classList && squareUnderMouse.classList.contains('square')) {
                    const computedColor = window.getComputedStyle(squareUnderMouse).getPropertyValue('background-color');
                    const colorChanged = colorChangedMap.get(squareUnderMouse);
                    if (!colorChanged) {
                        if (computedColor === hexToRgb(selectedColor)) {
                            squareUnderMouse.style.backgroundColor = DEFAULT_COLOR;
                        } 
                        else {
                            squareUnderMouse.style.backgroundColor = selectedColor;
                        }
                        colorChangedMap.set(squareUnderMouse, true);
                    }
                }
            }
        });

        document.addEventListener('mouseup', () => {
            isMouseDown = false;
            colorChangedMap.forEach((value, key) => {
                colorChangedMap.set(key, false);
            });
        });

        // In case the pointer leaves the window while dragging
        window.addEventListener('mouseleave', () => {
            if (isMouseDown !== false) {
                isMouseDown = false;
                colorChangedMap.forEach((value, key) => {
                    colorChangedMap.set(key, false);
                });
            }
        });

        // If a drag is ended, ensure state resets
        document.addEventListener('dragend', () => {
            isMouseDown = false;
            colorChangedMap.forEach((_, key) => {
                colorChangedMap.set(key, false);
            });
        });

        globalHandlersAdded = true;
    }
}

function saveMapAsJpg() {
    // Get the map-cont div
    const mapCont = document.getElementById('grid');

    // Use html2canvas to capture the content of the map-cont div
    html2canvas(mapCont).then(canvas => {
        // Create a data URL representing the canvas content as a JPG
        const dataURL = canvas.toDataURL('image/jpeg');

        // Create a link element to trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'map.jpg';

        // Append the link to the document and trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}

/**
 * Fill the entire canvas (all squares) with the currently picked color
**/
function fillCanvas() {
    const color = pickedColor || DEFAULT_COLOR;
    const squares = document.querySelectorAll('.square');
    squares.forEach(sq => {
        sq.style.backgroundColor = color;
        colorChangedMap.set(sq, false);
    });
}