// Canvas in which drawings are displayed
const canvasEl = document.getElementById("myCanvas");
const ctx = canvasEl.getContext("2d");

// Number of rows and columns for the grid
const GRID_COLS = 16;
const GRID_ROWS = 16;

// Initializes starting colour as white as the board starts black
let currentColour = "#ffffff";
let isPainting = false;

// 2D array to store square states. Starts as a fully black grid
let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill("#000000"));

// Undo/Redo History variables 
let storedStates = [JSON.parse(JSON.stringify(grid))]; 
let undoPointer = storedStates.length - 1;
const MAX_HISTORY_LENGTH = 20;

// Function to redraw the canvas keeping it as a fixed size at all times
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.getBoundingClientRect();

    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    updateButtonSizeAndPosition();
    drawGrid(); 
}


// Draws the grid from the grid array 
function drawGrid() {
    const rect = canvasEl.getBoundingClientRect();
    const cellWidth = rect.width / GRID_COLS;
    const cellHeight = rect.height / GRID_ROWS;

    ctx.clearRect(0, 0, rect.width, rect.height);

    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            // Always draw a background for each cell
            ctx.fillStyle = grid[row][col]; // Use stored color, default to black if null/undefined
            ctx.fillRect(
                col * cellWidth,
                row * cellHeight,
                cellWidth,
                cellHeight
            );
        }
    }

    // Draw grid lines
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, rect.height);
        ctx.stroke();
    }
    for (let j = 0; j <= GRID_ROWS; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * cellHeight);
        ctx.lineTo(rect.width, j * cellHeight);
        ctx.stroke();
    }
}

// Determines which cell is being pressed when the canvas is clicked
function getCellFromMouseEvent(e) {
    const rect = canvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = rect.width / GRID_COLS;
    const cellHeight = rect.height / GRID_ROWS;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    return { row, col };
}

// Colours a cell in the currently selected colour based on the click coordinates
function draw(e) {
    const { row, col } = getCellFromMouseEvent(e);
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        grid[row][col] = currentColour;
        drawGrid(); // Redraw immediately when a cell is changed
    }
}


canvasEl.addEventListener("mousemove", function(e) {
    if (isPainting) {
        draw(e);
    }
});

addEventListener('mousedown', (e) => {
    // Begins painting
    isPainting = true;
    draw(e); 
});

addEventListener('mouseup', e => {
    // Stops painting
    isPainting = false;

    const currentGridString = JSON.stringify(grid);
    const lastActiveStateString = JSON.stringify(storedStates[undoPointer]);

    // Only add a new state if the current grid is different from the last active state
    if (currentGridString !== lastActiveStateString) {
        // If we are not at the end of the history we need to truncate the history from the 
        // current undoPointer position.
        if (undoPointer < storedStates.length - 1) {
            storedStates = storedStates.slice(0, undoPointer + 1);
        }

        storedStates.push(JSON.parse(currentGridString));

        // Checks if all history is used up and if so removes the oldest item
        if (storedStates.length > MAX_HISTORY_LENGTH) {
            storedStates.shift(); // Remove the oldest state
        }

        // Update undoPointer to point to the new last state
        undoPointer = storedStates.length - 1;
    }

});


function keyPressHandler(e) {
      var evtobj = window.event ? window.event : e;

      // Ctrl + Z (Undo)
      if (evtobj.ctrlKey && evtobj.keyCode == 90) {
          if (undoPointer > 0) {
            undoPointer -= 1;
            // Load the previous grid state into the active 'grid' variable
            grid = JSON.parse(JSON.stringify(storedStates[undoPointer]));
            drawGrid();
          }
      }
      // Ctrl + Y (Redo)
      if (evtobj.ctrlKey && evtobj.keyCode == 89) {
          if (undoPointer < storedStates.length - 1) { 
              // Load the next grid state into the active 'grid' variable
              grid = JSON.parse(JSON.stringify(storedStates[undoPointer]));
              drawGrid();
          }
      }
}

// Initial setup
window.addEventListener("resize", resizeCanvas);
window.addEventListener("DOMContentLoaded", resizeCanvas);

// Call resizeCanvas immediately after script execution to ensure initial render
resizeCanvas();

updateButtonSizeAndPosition()