const pieces = document.querySelectorAll(".chess-piece");
const squares = document.querySelectorAll(".square");
const fenDisplay = document.querySelector("#fen");
const layers = document.querySelectorAll(".layer");
const nodes = document.querySelectorAll(".node");

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

const infoMenu = document.querySelector("#info-menuP");
const evalCalc = document.querySelector("#eval-calcP");

const layerDesc = document.querySelector("#layerDesc");
const layerDescContent = document.querySelector("#layerDescContent");
const descClose = document.querySelector("#desc-close");

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

layers.forEach((layer) =>  {
  layer.addEventListener("click", layerClick)
})

descClose.addEventListener("click", layerDescClose)

let small
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
    let bucket
    let psqt
    let npm
    let shuffling
    let simpleEval
    let pawnCount

    let positional
    let nnue
    let adjustedNNUE
    let complexity
    let evaluation
    let adjustedEval
    let clampedEval

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
        psqt = data[9][0]
        npm = data[10][0]
        shuffling = data[11][0]
        simpleEval = data[12][0]
        pawnCount = data[13][0]

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

        infoMenu.innerHTML = `Bucket: ${bucket}
                              <br>Net Used: ${small === 0 ? "nn-b1a57edbea57.nnue" : "nn-baff1ede1f90.nnue"}
                              <br>Net Size: ${small === 0 ? "Big" : "Small"}
                              <br>Simple Evaluation: ${simpleEval}
                              <br>Piece Square Table Value: ${psqt}
                              <br>Evaluation: ${eval}`

        positional = fc2 + ((fc0[15] * 150 / 127)|0)
        complexity = (Math.abs(psqt - positional) / 16) | 0
        nnue = ((1000 * psqt + 1048 * positional) / 16384) | 0
        adjustedNNUE = nnue - ((nnue * (complexity + Math.abs(simpleEval - nnue)) / 32768) | 0)
        evaluation = (adjustedNNUE * (915 + npm + 9 * pawnCount) / 1024) | 0
        adjustedEval = (evaluation * (200 - shuffling) / 214) | 0
        clampedEval = Math.max(-31507, Math.min(adjustedEval, 31507))

        evalCalc.innerHTML = `This is just the positional value. There are many variables in the total evaluation, lets calculate it!
<br>PSQT (Piece Square Tables Value) = ${psqt}&emsp;&emsp;PawnCount = ${pawnCount}&emsp;&emsp;50MoveRuleCount = ${shuffling}
<br>SimpleEvaluation = ${simpleEval}&emsp;&emsp;NPM: (Non Pawn Material) / 64 = ${npm}
<br>Positional: (Z1[15] * 150 / 127) + Z3 = ${positional}&emsp;&emsp;Complexity: abs(PSQT - Positional) / 16 = ${complexity}
<br>&emsp;<br>NNUE: (1000 * PSQT + 1048 * Positional) / 16384 = ${nnue}
<br>AdjustedNNUE: NNUE - (NNUE * (Complexity + abs(SimpleEvaluation - NNUE)) / 32768) = ${adjustedNNUE}
<br>Evaluation: AdjustedNNUE * (915 + NPM + 9 * PawnCount) / 1024 = ${evaluation}
<br>AdjustedEvaluation: Evaluation * (200 - 50MoveRuleCount) / 214 = ${adjustedEval}
<br>FinalEvaluation: clamp(AdjustedEvaluation, -31507, 31507) = ${clampedEval}
<br>&emsp;<br>The evaluation for this position is ${clampedEval}!`


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
    value = Math.cbrt((value - 0.5) / 4) + 0.5
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

function layerClick(e) {
  let layer = e.target;
  while (!layer.classList.contains('layer')) {
    layer = layer.parentElement
  }

  let content
  console.log(layer.id)
  if (layer.id === "fc0") {
    content = `Z1:<br>
    Length: 16<br>
    The board is turned into ${small === 0 ? 2560 : 128} inputs that get matrix multiplied by the respective weights and then have the respective biases added. This forms Z1!`

  } else if (layer.id === "ac0+acSq0") {
    content = `A1_Sq:<br>
    Length: 15<br>
    The first 15 indices of Z1 are inputted into a Squared Clipped ReLU function, min(Z1&sup2, 127) to form A1_Sq!<br>&emsp;<br>
    A1_CR:<br>
    Length: 15<br>
    The first 15 indices of Z1 are inputted into a Clipped ReLU function, clamp(Z1, 0, 127) to form A1_CR!`;

  } else if (layer.id === "acFinal0") {
    content = `A1:<br>
    Length: 30<br>
    A1_CR is appended to the end of A1_Sq to form A1!`

  } else if (layer.id === "fc1") {
    content = `Z2:<br>
    Length: 32<br>
    A1 is matrix multiplied by the respective weights and then have the respective biases added. This forms Z2!`

  } else if (layer.id === "ac1") {
    content = `A2:<br>
    Length: 32<br>
    The Z2 is inputted into a Clipped ReLU function, clamp(Z2, 0, 127) to form A2!`;

  } else if (layer.id === "fc2") {
    content = `Z3:<br>
    Length: 1<br>
    A2 is matrix multiplied by the respective weights and then have the respective biases added. This forms Z3, which is used to calculate the positional score of the position!`
  }
  layerDescContent.innerHTML = content;
  layerDesc.style.opacity = '1';
  layerDesc.style.visibility = 'visible';
  document.body.style.overflow = 'hidden';

  nodes.forEach((node) => {
    node.classList.add("overlay");
  })
}

function layerDescClose() {
  layerDescContent.textContent = '';
  layerDesc.style.opacity = '0';
  layerDesc.style.visibility = 'hidden';
  document.body.style.overflow = 'auto';

  nodes.forEach((node) => {
    node.classList.remove("overlay");
  })
}
