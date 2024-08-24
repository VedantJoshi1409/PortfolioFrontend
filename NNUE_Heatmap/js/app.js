const pieces = document.querySelectorAll(".chess-piece");
const squares = document.querySelectorAll(".square");
const fenDisplay = document.querySelector("#fen");

const fc0Map = document.querySelectorAll(".fc0.node")
const fc0P = document.querySelectorAll(".fc0_p")

const ac0Map = document.querySelectorAll(".ac0.node")
const acSq0P = document.querySelectorAll(".acSq0_p")
const ac0P = document.querySelectorAll(".ac0_p")

const acFinal0Map = document.querySelectorAll(".acFinal0.node")
const acFinal0P = document.querySelectorAll(".acFinal0_p")

const fc1Map = document.querySelectorAll(".fc1.node")
const fc1P = document.querySelectorAll(".fc1_p")

const ac1Map = document.querySelectorAll(".ac1.node")
const ac1P = document.querySelectorAll(".ac1_p")

const fc2Map = document.querySelector(".fc2.node")
const fc2P = document.querySelector(".fc2_p")

const pieceMap = {
  'wP1': 'P', 'wP2': 'P', 'wP3': 'P', 'wP4': 'P', 'wP5': 'P', 'wP6': 'P', 'wP7': 'P', 'wP8': 'P',
  'bP1': 'p', 'bP2': 'p', 'bP3': 'p', 'bP4': 'p', 'bP5': 'p', 'bP6': 'p', 'bP7': 'p', 'bP8': 'p',
  'wR1': 'R', 'wR2': 'R',
  'bR1': 'r', 'bR2': 'r',
  'wN1': 'N', 'wN2': 'N',
  'bN1': 'n', 'bN2': 'n',
  'wB1': 'B', 'wB2': 'B',
  'bB1': 'b', 'bB2': 'b',
  'wQ': 'Q', 'bQ': 'q',
  'wK': 'K', 'bK': 'k',

  // Menu pieces
  'menu-wP': 'P',
  'menu-bP': 'p',
  'menu-wR': 'R',
  'menu-bR': 'r',
  'menu-wN': 'N',
  'menu-bN': 'n',
  'menu-wB': 'B',
  'menu-bB': 'b',
  'menu-wQ': 'Q',
  'menu-bQ': 'q',
  'menu-wK': 'K',
  'menu-bK': 'k'
};

pieces.forEach((piece) => {
  piece.addEventListener("dragstart", dragStart);
})

squares.forEach((square) => {
  square.addEventListener("dragover", dragOver)
  square.addEventListener("dragenter", dragEnter)
  square.addEventListener("dragleave", dragLeave)
  square.addEventListener("drop", dragDrop)
  square.addEventListener("dragend", dragEnd)
})

updateHeatmap()

let beingDragged
let clone
let menuPiece
let side = true

function dragStart(e) {
  beingDragged = e.target
  if (beingDragged.parentElement && beingDragged.parentElement.closest("#piece-menu")) {
    clone = beingDragged.cloneNode(true)
    menuPiece = true
  } else {
    menuPiece = false
  }
  console.log("Dragging started on " + beingDragged.id)
  console.log("Is menu piece: " + menuPiece)
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  if (e.target.parentElement.closest("#gameboard")) {
    e.target.classList.add("highlight")
  }
}

function dragLeave(e) {
  e.target.classList.remove("highlight")
}

function dragDrop(e) {
  e.preventDefault()
  e.target.classList.remove("highlight")
  side = isLowerCase(pieceMap[beingDragged.id])

  if (e.target.parentElement.closest("#gameboard")) {
    let square

    if (e.target.classList.contains("chess-piece")) {
      square = e.target.parentElement
      e.target.remove()
    } else {
      square = e.target
    }

    if (menuPiece) {
      square.appendChild(clone)
      square.firstChild.addEventListener("dragstart", dragStart);
    } else {
      square.appendChild(beingDragged)
    }
    console.log("You have dropped on " + e.target.classList)

  } else {
    if (menuPiece) {
      clone.remove()
    } else {
      beingDragged.remove();
    }
    dragEnd()
  }
}

function dragEnd() {
  beingDragged = null;
  clone = null;
  menuPiece = false;
  console.log("Drag ended");
  getFen();
  updateHeatmap();
}

function getFen() {
  let square;
  let pieceCount = 0;
  let spaceCount = 0;
  let fen = "";
  let piece
  let whiteKing = 0;
  let blackKing = 0;

  for (let i = 0; i < 64; i++) {
    if (i % 8 === 0) {
      if (spaceCount !== 0) {
        fen += spaceCount;
        spaceCount = 0;
      }
      if (i !== 0) {
        fen += "/"
      }

      spaceCount = 0;
    }

    square = squares[i];
    if (square.children.length > 0) {
      if (spaceCount !== 0) {
        fen += spaceCount;
        spaceCount = 0;
      }

      pieceCount++;

      piece = pieceMap[square.children[0].id];
      fen += piece;
      if (piece === 'K') {
        whiteKing++;
      } else if (piece === 'k') {
        blackKing++;
      }

    } else {
      spaceCount++;
    }
  }
  if (side) {
    fen += " w"
  } else {
    fen += " b"
  }

  if (pieceCount > 32) {
    fenDisplay.textContent = "Invalid: Too many pieces";
  } else if (whiteKing !== 1 || blackKing !== 1) {
    fenDisplay.textContent = "Invalid: Incorrect Amount of Kings";
  } else {
    fenDisplay.textContent = fen;
  }
}

function isLowerCase(char) {
  return char === char.toLowerCase() && char !== char.toUpperCase();
}

function updateHeatmap() {
  if (fenDisplay.textContent !== "Invalid: Too many pieces" && fenDisplay.textContent !== "Invalid: Incorrect Amount of Kings") {
    const url = "https://what1409.onthewifi.com/visualize?fen=" + fenDisplay.textContent;
    let fc0 = new Array(16)
    let ac0 = new Array(15)
    let acsq0 = new Array(15)
    let acfinal0 = new Array(30)
    let fc1 = new Array(32)
    let ac1 = new Array(32)
    let fc2
    let eval
    let small
    let bucket

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse JSON response
      })
      .then(data => {
        console.log(data)

        for (let i = 0; i < 16; i++) {
          fc0[i] = data[0][i];
        }

        for (let i = 0; i < 15; i++) {
          ac0[i] = data[2][i];
        }

        for (let i = 0; i < 15; i++) {
          acsq0[i] = data[1][i];
        }

        for (let i = 0; i < 30; i++) {
          acfinal0[i] = data[1][i];
        }

        fc1 = data[3];
        ac1 = data[4];
        fc2 = data[5][0];
        eval = data[6][0]
        small = data[7][0];
        bucket = data[8][0]

        // console.log(fc0)
        // console.log(acsq0)
        // console.log(ac0)
        // console.log(acfinal0)
        // console.log(fc1)
        // console.log(ac1)
        // console.log(fc2)
        // console.log(eval)
        // console.log(small)
        // console.log(bucket)
        for (let i = 0; i < 16; i++) {
          fc0Map[i].style.backgroundColor = getColor(fc0[i], 5000, -5000, 1, false)
          fc0P[i].textContent = fc0[i];
        }

        for (let i = 0; i < 15; i++) {
          ac0Map[i].style.backgroundColor = getColor(acsq0[i], 75, -75, 1, false)
          acSq0P[i].textContent = acsq0[i]
        }

        for (let i = 0; i < 15; i++) {
          ac0Map[i + 15].style.backgroundColor = getColor(ac0[i], 75, -75, 1, false)
          ac0P[i].textContent = ac0[i]
        }

        for (let i = 0; i < 30; i++) {
          acFinal0Map[i].style.backgroundColor = getColor(acfinal0[i], 75, -75, 1, false)
          acFinal0P[i].textContent = acfinal0[i]
        }

        for (let i = 0; i < 32; i++) {
          fc1Map[i].style.backgroundColor = getColor(fc1[i], 5000, -5000, 1, false)
          fc1P[i].textContent = fc1[i];
        }

        for (let i = 0; i < 32; i++) {
          ac1Map[i].style.backgroundColor = getColor(ac1[i], 75, -75, 1, false)
          ac1P[i].textContent = ac1[i];
        }

        fc2Map.style.backgroundColor = getColor(fc2, 15000, -15000, 1, false)
        fc2P.textContent = fc2;


      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }
}

function getColor(value, max, min, opacity, linear) {
  // Normalize value from -5000 to 5000 to a 0-1 range
  value = Math.max(min, Math.min(max, value));
  value = (value - min) / (max - min);

  if (!linear) {
    // value = 4 * Math.pow(value - 0.5, 3) + 0.5
    value = Math.cbrt((value-0.5)/4)+0.5
  }
  // console.log(normalizedValue);

  let r, g, b;

  if (value <= 0.5) {
    // Interpolate between #01ABFF and white
    let t = value * 2;
    r = Math.round(1 + (255 - 1) * t);    // Blue to white (red channel)
    g = Math.round(171 + (255 - 171) * t); // Blue to white (green channel)
    b = Math.round(255 + (255 - 255) * t); // Blue to white (blue channel)
  } else {
    // Interpolate between white and #F35454
    let t = (value - 0.5) * 2;
    r = Math.round(255 - (255 - 243) * t);  // White to red (red channel)
    g = Math.round(255 - (255 - 84) * t);   // White to red (green channel)
    b = Math.round(255 - (255 - 84) * t);   // White to red (blue channel)
  }

  // Return the color as a string in the format "rgb(R, G, B)"
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
