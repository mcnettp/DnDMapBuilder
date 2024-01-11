// Flag to track whether the mouse button is currently pressed down
let isMouseDown = false;
let pickedColor = "#000000";

// Map to track colorChanged state for each square
const colorChangedMap = new Map();

/**
* Converts the function in Hex to the RGB value
* @param {string} hex value: #0000FF
* @returns RGB Value: rgb(0, 0, 0)
**/
function hexToRgb(hex)
{
    // Get rid of the # character
    hex = hex.replace('#', '');

    // Parse the values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    //console.log('R: ', r);
    //console.log('G: ', g);
    //console.log('B: ', b);

    // Return the RGB
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

/**
* Function to update the selected color from the color wheel
* @param {string} color 
**/
function updateColor(color)
{
    document.getElementById('selectedColor').innerText = 'Selected Color: ' + color;
    pickedColor = color;
}

/**
* Function to Draw the Map based on the number of columns and rows
* Also handles the input for clicking to change the color
**/
function createMap()
{
    const columns = parseInt(document.getElementById('columns').value);
    const rows = parseInt(document.getElementById('rows').value);
    const mapContainer = document.getElementById('grid');

    // Clear Previous Map
    mapContainer.innerHTML = '';

    mapContainer.style.gridTemplateColumns = 'repeat(${columns}, 50px)';
    mapContainer.style.gridTemplateRows = 'repeat(${rows}, 50px)';

    // Set Color Picker
    const defaultColor = '#FFFFFF'; // Default Background Color
    let selectedColor = pickedColor; // Initial to the Default Background Color

    // Draw by Number of Columns x Number of Rows
    for (let i = 0; i < rows; ++i)
    {
        for (let j = 0; j < columns; ++j)
        {
            const square = document.createElement('div');
            square.classList.add('square');
            square.style.backgroundColor = defaultColor;
            colorChangedMap.set(square, false); // Initialize colorChanged
            
            square.addEventListener('mousedown', function()
            {
                isMouseDown = true;
                selectedColor = pickedColor;
                const computedColor = window.getComputedStyle(this).getPropertyValue('background-color');
                const colorChanged = colorChangedMap.get(this);
                //console.log("selectedColor: ", hexToRgb(selectedColor));
                //console.log("computedColor: ", computedColor);
                if (!colorChanged)
                {
                    if (computedColor === hexToRgb(selectedColor))
                    {
                        this.style.backgroundColor = defaultColor;
                    }
                    else
                    {
                        this.style.backgroundColor = selectedColor;
                    }
                    colorChangedMap.set(this, true); // Set color changed flag to true for this square
                }
            });

            // Set row and column for the square
            square.style.gridColumn = j + 1;
            square.style.gridRow = i + 1;

            mapContainer.appendChild(square);
        }
    }
    
    // Event listener for mouse move on the entire document
    document.addEventListener('mousemove', function(event)
    {
        if (isMouseDown)
        {
            //console.log("Mouse Move Hit");
            const squareUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
            if (squareUnderMouse.classList.contains('square'))
            {
                const computedColor = window.getComputedStyle(squareUnderMouse).getPropertyValue('background-color');
                const colorChanged = colorChangedMap.get(squareUnderMouse);
                if (!colorChanged)
                {
                    if (computedColor === hexToRgb(selectedColor)) 
                    {
                        squareUnderMouse.style.backgroundColor = defaultColor;
                    } 
                    else 
                    {
                        squareUnderMouse.style.backgroundColor = selectedColor;
                    }
                    colorChangedMap.set(squareUnderMouse, true); // Set color changed flag to true for this square
                }
            }
        }
    });

    // Event listener for mouse up on the entire document
    document.addEventListener('mouseup', function()
    {
        isMouseDown = false; // Set flag to false when mouse button is released

        // Reset colorChanged flag for all squares
        colorChangedMap.forEach((value, key) => {
            colorChangedMap.set(key, false);
        });
    });
}

function saveMapAsJpg()
{
    // Get the map-cont div
    const mapCont = document.getElementById('grid');

    // Use html2canvas to capture the content of the map-cont div
    html2canvas(mapCont).then(canvas =>
    {
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