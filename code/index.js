const canvasEl = document.getElementById("myCanvas");
const ctx = canvasEl.getContext("2d");


const GRID_COLS = 16;
const GRID_ROWS = 16;

let currentColour = "#ffffff"
let isPainting = false

// 2D array to store square states (0 = off, 1 = filled)
let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill("#000000"));

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.getBoundingClientRect();

    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    updateButtonSizeAndPosition();
    drawGrid(); // Redraw from state
}

function drawGrid() {
    const rect = canvasEl.getBoundingClientRect();
    const cellWidth = rect.width / GRID_COLS;
    const cellHeight = rect.height / GRID_ROWS;

    ctx.clearRect(0, 0, rect.width, rect.height);

    for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
        if (grid[row][col]) {
            ctx.fillStyle = grid[row][col];
            ctx.fillRect(
                col * cellWidth,
                row * cellHeight,
                cellWidth,
                cellHeight
        );
        }
    }
    }

    // Optional: draw grid lines
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

canvasEl.addEventListener("mousemove", function(e) {
    if (isPainting) {
        draw(e);
    }
    
});

addEventListener('mousedown', (e) => {
    isPainting = true;
    draw(e)
});

addEventListener('mouseup', e => {
    isPainting = false;
});



function draw(e) {
    const { row, col } = getCellFromMouseEvent(e);
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        grid[row][col] = currentColour; 
        drawGrid();
    }
}


const button = document.getElementById("colourContainer");

function updateButtonSizeAndPosition() {
      const rect = canvasEl.getBoundingClientRect();
      const cellWidth = rect.width / GRID_COLS;
      const cellHeight = rect.height / GRID_ROWS;

      // Position the button in the top-left grid cell
      button.style.width = `${cellWidth}px`;
      button.style.height = `${cellHeight}px`;
      button.style.fontSize = `${Math.min(cellWidth, cellHeight) * 0.3}px`;
}

// Initial setup
window.addEventListener("resize", resizeCanvas);
window.addEventListener("DOMContentLoaded", resizeCanvas);