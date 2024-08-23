const pieces = document.querySelectorAll(".chess-piece");
const squares = document.querySelectorAll(".square");
const fenDisplay = document.querySelector("#fen");

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

let beingDragged
let clone
let menuPiece

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

function dragLeave (e){
  e.target.classList.remove("highlight")
}

function dragDrop (e){
  e.preventDefault()
  e.target.classList.remove("highlight")

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

function dragEnd (){
  beingDragged = null;
  clone = null;
  menuPiece = false;
  console.log("Drag ended")
  getFen();
}

function getFen() {
  let square;
  let piece;
  let pieceCount = 0;
  let spaceCount = 0;
  let fen = "";

  for (let i = 0; i < 64; i++) {
    if (i%8 === 0) {
      if (spaceCount !== 0) {
        fen+=spaceCount;
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
        fen+=spaceCount;
        spaceCount = 0;
      }

      pieceCount++;
      fen += pieceMap[square.children[0].id];
    } else {
      spaceCount++;
    }
  }

  if (pieceCount > 32) {
    fenDisplay.textContent = "Invalid: Too many pieces";
  } else {
    fenDisplay.textContent = fen;
  }
}
