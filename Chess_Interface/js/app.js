document.querySelector("#start-menu").style.visibility = "visible";
document.querySelector("#start-menu").style.opacity = "1";

const sessionId = startSession()
let baseUrl

async function startSession() {
  try {
    const response = await fetch('https://what1409.onthewifi.com/start-session', {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log("Session started");
    const data = await response.text(); // or response.text() if the response is not JSON
    let session = data.toString()

    baseUrl = 'https://what1409.onthewifi.com/engine?session=' + session + '&command='
    await fetch(baseUrl + 'uci', {
      method: 'GET',
    });

    setInterval(refreshSession, 15000)

    return session;
  } catch (err) {
    console.error('Fetch failed:', err);
    return null;
  }
}

function refreshSession() {
  fetch(baseUrl + 'refresh', {
    method: 'GET'
  })
    .catch(error => {
      console.error('Error:', error);
    });
}


function toggleActive(activeId, inactiveId) {
  document.getElementById(activeId).classList.add('active');
  document.getElementById(inactiveId).classList.remove('active');
}

const whiteResignFlag = new Image()
const blackResignFlag = new Image()
whiteResignFlag.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/resign_white_1024x-mjE9rJZDXVt3rbzy.png"
blackResignFlag.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/resign_black_1024x-YbN9rEGoPjfQ7BEp.png"

const wQPromote = new Image()
const bQPromote = new Image()
const wRPromote = new Image()
const bRPromote = new Image()
const wBPromote = new Image()
const bBPromote = new Image()
const wNPromote = new Image()
const bNPromote = new Image()

wQPromote.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/wq-d95gnqyxzDhy9N7Z.png";
bQPromote.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/bq-AoPGK2zRLWSveOV0.png";
wRPromote.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/wr-m7VKXvBaXRHylaPe.png";
bRPromote.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/br-ALpog5D4NqCnkaKZ.png";
wBPromote.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/wb-m7VKXvBa7WTKNaL2.png";
bBPromote.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/bb-mePnKE0RKDSJ6NnM.png";
wNPromote.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/wn-mxB7KO0Ro4H6rL4B.png";
bNPromote.src = "https://assets.zyrosite.com/YrDNgq93l5HOqyox/bn-m6LJX7oBXxf1nvyb.png";

const promoteFlag = 1;
const enPassantFlag = 2;
const checkFlag = 3;

let currentPlayer;
let player, wtime, btime, inc;
let lastMoveTime;
let wClock, bClock;
let wBox, bBox;
let squares = document.querySelectorAll(".square"), pieces = document.querySelectorAll(".piece");
let legalMoves; //move + captureFlag + promoteFlag + enPassantFlag + Check Flag + GameEndState
let positionCommand;
let pieceMap = {"pawn": 0, "knight": 1, "bishop": 2, "rook": 3, "queen": 4, "king": 5}
let promotionBank = document.querySelectorAll(".promotion");
let promotedBank;
let ticking;
let gameNum = 0;
let promoteImg = document.querySelectorAll(".promote-img");
let promoteMenu = document.querySelector("#promote-menu");
let checkSquare = null;
let startSquareHighlight = null;
let endSquareHighlight = null;

document.querySelector("#start-button").addEventListener("click", () => {
  fetch(baseUrl + 'ucinewgame', {
    method: 'GET',
  });
  clearAllHighlights();

  gameNum++;

  currentPlayer = true;
  positionCommand = "position startpos";
  promotedBank = []

  let docTime = document.querySelector("#time-input");
  let docInc = document.querySelector("#increment-input");
  let menu = document.querySelector("#start-menu");

  let game = document.querySelector("#game");

  player = document.querySelector("#white-button").classList.contains("active");
  wtime = btime = parseInt(docTime.value) * 1000;
  inc = parseInt(docInc.value) * 1000;

  if (isNaN(wtime)) {
    wtime = btime = parseInt(docTime.placeholder) * 1000;
  }
  if (isNaN(inc)) {
    inc = parseInt(docInc.placeholder) * 1000;
  }

  if (player) {
    document.querySelector("#resign-flag").setAttribute("src", whiteResignFlag.src)
    for (let i = 0; i < 64; i++) {
      squares[i].style.top = Math.floor(i / 8) * 50 + "px";
      squares[i].style.left = Math.floor(i % 8) * 50 + "px";
    }

    wClock = document.querySelector("#bottom-clock");
    bClock = document.querySelector("#top-clock");

    wBox = document.querySelector("#captured-pieces-right");
    bBox = document.querySelector("#captured-pieces-left");

    legalMoves = ['a2a400000', 'a2a300000', 'b2b400000', 'b2b300000', 'c2c400000', 'c2c300000', 'd2d400000', 'd2d300000', 'e2e400000', 'e2e300000', 'f2f400000', 'f2f300000', 'g2g400000', 'g2g300000', 'h2h400000', 'h2h300000', 'b1a300000', 'b1c300000', 'g1f300000', 'g1h300000'];

    promoteImg[0].setAttribute("src", wQPromote.src);
    promoteImg[1].setAttribute("src", wRPromote.src);
    promoteImg[2].setAttribute("src", wBPromote.src);
    promoteImg[3].setAttribute("src", wNPromote.src);
  } else {
    document.querySelector("#resign-flag").setAttribute("src", blackResignFlag.src)
    for (let i = 0; i < 64; i++) {
      squares[i].style.top = (7 - Math.floor(i / 8)) * 50 + "px";
      squares[i].style.left = Math.floor(i % 8) * 50 + "px";
    }

    wClock = document.querySelector("#top-clock");
    bClock = document.querySelector("#bottom-clock");

    wBox = document.querySelector("#captured-pieces-left");
    bBox = document.querySelector("#captured-pieces-right");

    promoteImg[0].setAttribute("src", bQPromote.src);
    promoteImg[1].setAttribute("src", bRPromote.src);
    promoteImg[2].setAttribute("src", bBPromote.src);
    promoteImg[3].setAttribute("src", bNPromote.src);
  }

  squares[0].appendChild(pieces[24]);
  squares[1].appendChild(pieces[26]);
  squares[2].appendChild(pieces[28]);
  squares[3].appendChild(pieces[30]);
  squares[4].appendChild(pieces[31]);
  squares[5].appendChild(pieces[29]);
  squares[6].appendChild(pieces[27]);
  squares[7].appendChild(pieces[25]);

  squares[8].appendChild(pieces[16]);
  squares[9].appendChild(pieces[17]);
  squares[10].appendChild(pieces[18]);
  squares[11].appendChild(pieces[19]);
  squares[12].appendChild(pieces[20]);
  squares[13].appendChild(pieces[21]);
  squares[14].appendChild(pieces[22]);
  squares[15].appendChild(pieces[23]);

  squares[48].appendChild(pieces[0]);
  squares[49].appendChild(pieces[1]);
  squares[50].appendChild(pieces[2]);
  squares[51].appendChild(pieces[3]);
  squares[52].appendChild(pieces[4]);
  squares[53].appendChild(pieces[5]);
  squares[54].appendChild(pieces[6]);
  squares[55].appendChild(pieces[7]);

  squares[56].appendChild(pieces[8]);
  squares[57].appendChild(pieces[10]);
  squares[58].appendChild(pieces[12]);
  squares[59].appendChild(pieces[14]);
  squares[60].appendChild(pieces[15]);
  squares[61].appendChild(pieces[13]);
  squares[62].appendChild(pieces[11]);
  squares[63].appendChild(pieces[9]);
  /*pieces.forEach((piece) => {
    if (!piece.parentElement.classList.contains("square")) {
      piece.style.display = "none";
      piece.style.visibility = "hidden";
      piece.style.opacity = "0"
    }
  })*/

  lastMoveTime = Date.now()
  resetClocks()
  startTicking();

  if (!player) {
    getEngineMove()
  }

  menu.style.display = "none";
  menu.style.visibility = "hidden";
  menu.style.opacity = "0";

  game.style.opacity = "1";
  game.style.visibility = "visible";
  game.style.display = "flex";
})

document.querySelector("#restart-button").addEventListener("click", () => {
  let menu = document.querySelector("#start-menu");
  let game = document.querySelector("#game");
  let screen = document.querySelector("#end-screen")
  let resign = document.querySelector("#resign-button");
  // document.querySelector("#board").style.mixBlendMode = "normal";
  pieces.forEach((piece) => {
    // piece.style.mixBlendMode = "normal"
    piece.addEventListener("dragstart", dragStart)
    piece.style.cursor = "pointer"
  })

  squares.forEach((square) => {
    square.addEventListener("dragover", dragOver)
    square.addEventListener("drop", dragDrop)
    square.addEventListener("dragend", dragEnd)
  })

  screen.style.display = "none";
  screen.style.visibility = "hidden";
  screen.style.opacity = "0";

  menu.style.display = "flex";
  menu.style.visibility = "visible";
  menu.style.opacity = "1";

  game.style.opacity = "0";
  game.style.visibility = "hidden";
  game.style.display = "none";

  resign.style.display = "flex";
  resign.style.visibility = "visible";
  resign.style.opacity = "1";

  if (checkSquare !== null) {
    checkSquare.classList.remove('checkMateHighlight');
    checkSquare = null;
  }

  if (startSquareHighlight !== null) {
    startSquareHighlight.classList.remove('finalMoveHighlight');
  }
  if (endSquareHighlight !== null) {
    endSquareHighlight.classList.remove('finalMoveHighlight');
  }
})

async function getPromotionPiece(startSquare) {
  let promoteNum = -1;

  document.querySelector("#promote-queen-button").addEventListener("click", () => {
    promoteNum = 4;
    hidePromotionMenu();
  });

  document.querySelector("#promote-rook-button").addEventListener("click", () => {
    promoteNum = 1;
    hidePromotionMenu();
  });

  document.querySelector("#promote-bishop-button").addEventListener("click", () => {
    promoteNum = 3;
    hidePromotionMenu();
  });

  document.querySelector("#promote-knight-button").addEventListener("click", () => {
    promoteNum = 2;
    hidePromotionMenu();
  });

  promoteMenu.style.left = (startSquare.charCodeAt(0) - 'a'.charCodeAt(0)) * 50 + 100 + "px";
  promoteMenu.style.display = "block";
  promoteMenu.style.visibility = "visible";
  promoteMenu.style.opacity = "1";

  function waitForPromotion() {
    return new Promise(resolve => {
      const checkPromotion = () => {
        if (promoteNum !== -1) {
          resolve(promoteNum);
        } else {
          setTimeout(checkPromotion, 100);
        }
      };
      checkPromotion();
    });
  }

  await waitForPromotion();
  return promoteNum;
}

function hidePromotionMenu() {
  promoteMenu.style.visibility = "hidden";
  promoteMenu.style.opacity = "0";
  promoteMenu.style.display = "none";
}

document.querySelector("#resign-flag").addEventListener("click", resign);
squares = document.querySelectorAll(".square")
pieces = document.querySelectorAll(".piece")

pieces.forEach((piece) => {
  piece.addEventListener("dragstart", dragStart);
})

squares.forEach((square) => {
  square.addEventListener("dragover", dragOver)
  square.addEventListener("drop", dragDrop)
  square.addEventListener("dragend", dragEnd)
})

promotionBank.forEach((promotion) => {
  promotion.addEventListener("dragstart", dragStart);
})

function startTicking() {
  let timeSinceLastMove = Date.now() - lastMoveTime;
  if (currentPlayer) {
    wClock.innerHTML = `${Math.max(0, Math.floor((wtime - timeSinceLastMove) / 60000))}:${((Math.max(0, (wtime - timeSinceLastMove)) / 1000) % 60).toFixed(1).toString().padStart(4, '0')}`;
    if (wtime - timeSinceLastMove <= 0) {
      endScreen(2)
      return;
    }
  } else {
    bClock.innerHTML = `${Math.max(0, Math.floor((btime - timeSinceLastMove) / 60000))}:${((Math.max(0, (btime - timeSinceLastMove)) / 1000) % 60).toFixed(1).toString().padStart(4, '0')}`;
    if (btime - timeSinceLastMove <= 0) {
      endScreen(1)
      return;
    }
  }
  ticking = requestAnimationFrame(startTicking);
}

function resetClocks() {
  wClock.innerHTML = `${Math.floor(wtime / 60000)}:${((wtime / 1000) % 60).toFixed(1).toString().padStart(4, '0')}`;
  bClock.innerHTML = `${Math.floor(btime / 60000)}:${((btime / 1000) % 60).toFixed(1).toString().padStart(4, '0')}`;
}

let beingDragged;
let startSquare;
let endSquares;

function dragStart(e) {
  beingDragged = e.target.parentElement;
  if (currentPlayer === player) {
    startSquare = beingDragged.parentElement.getAttribute("data-position");
    endSquares = getMoves(startSquare);
    highlightMoves(endSquares)
  }
}

function dragOver(e) {
  e.preventDefault()
}

async function dragDrop(e) {
  let end = e.target;
  while (end.getAttribute('data-position') === null) {
    end = end.parentElement;
  }
  if (endSquares.includes(end.getAttribute("data-position"))) {
    if (checkSquare !== null) {
      checkSquare.classList.remove("checkHighlight");
    }
    let moveString = startSquare + end.getAttribute("data-position");
    let move = getMove(moveString);

    if (end.childElementCount > 0) {
      moveToCaptureBox(end.firstChild)
    }
    if (!isCastle(moveString)) {
      if (getMoveFlag(move, promoteFlag) !== 0) {
        let draggedPiece = beingDragged
        let promoteNum = await getPromotionPiece(startSquare)
        let offset = currentPlayer ? 0 : 4
        let clone = promotionBank[Number(promoteNum) + offset - 1].cloneNode(true);
        promotedBank.push(draggedPiece);
        document.querySelector(`[data-position="${moveString.substring(0, 2)}"]`).removeChild(draggedPiece);

        end.appendChild(clone);
        clone.addEventListener("dragstart", dragStart);

        if (promoteNum === 1) {
          moveString += "r"
        } else if (promoteNum === 2) {
          moveString += "n"
        } else if (promoteNum === 3) {
          moveString += "b";
        } else if (promoteNum === 4) {
          moveString += "q";
        }
      } else {
        end.appendChild(beingDragged);
        if (getMoveFlag(move, enPassantFlag) !== 0) {
          moveToCaptureBox(document.querySelector(`[data-position="${getEnPassantSquare(moveString)}"]`).firstChild)
        }
      }
    }
    if (getMoveFlag(move, checkFlag) !== 0) {
      checkHighlight()
    }
    moveHighlight(moveString)
    addToHistory(moveString);

    updateTime()
    currentPlayer = !currentPlayer;

    getEngineMove()
  }
}

function dragEnd() {
  removeHighlight(endSquares)
  beingDragged = null;
  startSquare = null;
  endSquares = []
}

function getMoves(startSquare) {
  let moves = [];
  for (let i = 0; i < legalMoves.length; i++) {
    if (legalMoves[i].substring(0, 2) === startSquare) {
      moves.push(legalMoves[i].substring(2, 4));
    }
  }
  return moves;
}

function highlightMoves(moves) {
  for (let move of moves) {
    document.querySelector(`[data-position="${move}"]`).classList.add('highlight');
  }
}

function removeHighlight(moves) {
  for (let move of moves) {
    document.querySelector(`[data-position="${move}"]`).classList.remove('highlight');
  }
}

function addToHistory(move) {
  if (positionCommand === "position startpos") {
    positionCommand += " moves";
  }
  positionCommand += " " + move;
}

async function getEngineMove() {
  let num = gameNum;
  await fetch(baseUrl + positionCommand, {
    method: 'GET',
  });

  let response = await fetch(baseUrl + `go wtime ${wtime} btime ${btime} winc ${inc} binc ${inc}`, {
    method: 'GET',
  });
  const data = await response.text();
  if (gameNum === num) {
    if (checkSquare !== null) {
      checkSquare.classList.remove("checkHighlight");
    }
    let temp = data.split("\n");
    let moves = temp[0].split(" ");

    legalMoves = []
    for (let i = 1; i < moves.length; i++) {
      legalMoves.push(moves[i]);
    }

    let moveInfo = temp[1].split(" ");
    let bestmove = moveInfo[1], capture = moveInfo[2], promotion = moveInfo[3], enPassant = moveInfo[4],
      check = moveInfo[5];
    if (check !== "0") {
      checkHighlight()
    }
    if (!isCastle(bestmove)) {
      let piece = document.querySelector(`[data-position="${bestmove.substring(0, 2)}"]`).firstChild;
      let endSquare = document.querySelector(`[data-position="${bestmove.substring(2, 4)}"]`);
      if (capture === "1") {
        moveToCaptureBox(endSquare.firstChild)
      }
      if (enPassant === "1") {
        moveToCaptureBox(document.querySelector(`[data-position="${getEnPassantSquare(bestmove)}"]`).firstChild)
      }
      if (promotion !== "0") {
        let offset = currentPlayer ? 0 : 4
        let clone = promotionBank[Number(promotion) + offset - 1].cloneNode(true);
        promotedBank.push(piece)
        document.querySelector(`[data-position="${bestmove.substring(0, 2)}"]`).removeChild(piece);
        piece = clone;
      }
      moveHighlight(bestmove);
      endSquare.appendChild(piece);
    }


    addToHistory(bestmove)
    updateTime()
    currentPlayer = !currentPlayer;
    if (moves[1].length === 1) {
      endScreen(Number(moves[1]));
    }
  }
}

function updateTime() {
  if (currentPlayer) {
    wtime -= Date.now() - lastMoveTime;
    wtime += inc;
  } else {
    btime -= Date.now() - lastMoveTime;
    btime += inc;
  }

  lastMoveTime = Date.now();
  resetClocks()
}

function sortBoxes() {
  let box;
  for (let i = 0; i < 2; i++) {
    switch (i) {
      case 0:
        box = wBox;
        break;
      case 1:
        box = bBox;
        break;
    }
    let pieces = Array.from(box.childNodes);

    pieces.sort((a, b) => {
      return pieceMap[a.getAttribute("data-piece")] - pieceMap[b.getAttribute("data-piece")];
    });

    while (box.firstChild) {
      box.removeChild(box.firstChild);
    }

    pieces.forEach(piece => box.appendChild(piece));
  }
}

function getEnPassantSquare(move) {
  return move.charAt(2) + move.charAt(1);
}

function moveToCaptureBox(piece) {
  if (piece.classList.contains('promotion')) {
    piece.parentElement.removeChild(piece);
    for (let i = 0; i < promotedBank.length; i++) {
      if (promotedBank[i].getAttribute("data-color") === (!currentPlayer ? "white" : "black")) {
        piece = promotedBank[i];
        promotedBank.splice(i, 1);
        break;
      }
    }
  }
  if (currentPlayer) {
    wBox.appendChild(piece);
  } else {
    bBox.appendChild(piece);
  }
  piece.style.cursor = "initial"
  piece.setAttribute('draggable', 'false')
  sortBoxes();
}

function resign() {
  endScreen(player ? 2 : 1)
}

//1 - White wins
//2 - Black wins
//3 - 3 Fold repetition
//4 - 50 move rule
//5 - Stalemate
function endScreen(endType) {
  gameNum++;

  clearAllHighlights()
  finishingMove()

  hidePromotionMenu()
  let screen = document.querySelector("#end-screen");
  let text = document.querySelector("#end-screen-text");
  let resign = document.querySelector("#resign-button");

  cancelAnimationFrame(ticking);
  let innerString;

  switch (endType) {
    case 1: {
      innerString = `White Wins!`
      break;
    }
    case 2: {
      innerString = `Black Wins!`
      break;
    }
    case 3: {
      innerString = `Threefold Repetition!`
      break;
    }
    case 4: {
      innerString = `50-Move Rule Draw!`
      break;
    }
    case 5: {
      innerString = `Stalemate!`
      break;
    }
  }

  text.innerHTML = innerString;
  // document.querySelector("#board").style.mixBlendMode = "multiply";
  pieces.forEach((piece) => {
    // piece.style.mixBlendMode = "multiply"
    piece.removeEventListener("dragstart", dragStart)
    piece.style.cursor = "initial"
  })

  squares.forEach((square) => {
    square.removeEventListener("dragover", dragOver)
    square.removeEventListener("drop", dragDrop)
    square.removeEventListener("dragend", dragEnd)
  })

  resign.style.display = "none";
  resign.style.visibility = "hidden";
  resign.style.opacity = "0";

  screen.style.display = "flex";
  screen.style.visibility = "visible";
  screen.style.opacity = "1";
}

function isCastle(move) {
  let piece = document.querySelector(`[data-position="${move.substring(0, 2)}"]`).firstChild;
  if (piece.getAttribute("data-piece") === "king") {
    if (move === "e1g1") {
      document.querySelector(`[data-position="g1"]`).appendChild(piece);
      document.querySelector(`[data-position="f1"]`).appendChild(document.querySelector(`[data-position="h1"]`).firstChild);
    } else if (move === "e1c1") {
      document.querySelector(`[data-position="c1"]`).appendChild(piece);
      document.querySelector(`[data-position="d1"]`).appendChild(document.querySelector(`[data-position="a1"]`).firstChild);
    } else if (move === "e8g8") {
      document.querySelector(`[data-position="g8"]`).appendChild(piece);
      document.querySelector(`[data-position="f8"]`).appendChild(document.querySelector(`[data-position="h8"]`).firstChild);
    } else if (move === "e8c8") {
      document.querySelector(`[data-position="c8"]`).appendChild(piece);
      document.querySelector(`[data-position="d8"]`).appendChild(document.querySelector(`[data-position="a8"]`).firstChild);
    } else {
      return false;
    }
    return true;
  }
  return false;
}

//1 - Promote
//3 - enPassant
//4 - Check
function getMoveFlag(move, flag) {
  let offset = 0;
  if (isNaN(move.charAt(4))) {
    offset = 1;
  }
  return Number(move.charAt(4 + flag + offset));
}

function getMove(move) {
  for (let i = 0; i < legalMoves.length; i++) {
    if (legalMoves[i].substring(0, 4) === move) {
      return legalMoves[i];
    }
  }
}

function moveHighlight(move) {
  clearOldHighlight()
  startSquareHighlight = document.querySelector(`[data-position="${move.substring(0, 2)}"]`)
  endSquareHighlight = document.querySelector(`[data-position="${move.substring(2, 4)}"]`)
  startSquareHighlight.classList.add('moveHighlight');
  endSquareHighlight.classList.add('moveHighlight');
}

function finishingMove() {
  clearOldHighlight()
  if (startSquareHighlight !== null) {
    startSquareHighlight.classList.add('finalMoveHighlight');
  }
  if (endSquareHighlight !== null) {
    endSquareHighlight.classList.add('finalMoveHighlight');
  }
}

function clearOldHighlight() {
  if (startSquareHighlight !== null) {
    startSquareHighlight.classList.remove('moveHighlight');
  }
  if (endSquareHighlight !== null) {
    endSquareHighlight.classList.remove('moveHighlight');
  }
}

function checkHighlight() {
  let color = currentPlayer ? "black" : "white";
  pieces.forEach((piece) => {
    if (piece.getAttribute("data-color") === color && piece.getAttribute("data-piece") === "king") {
      piece.parentElement.classList.add("checkHighlight")
      checkSquare = piece.parentElement;
    }
  })
}

function clearAllHighlights() {
  squares.forEach((square) => {
    square.classList.remove('highlight');
    square.classList.remove('moveHighlight');
    square.classList.remove('finalMoveHighlight');
    square.classList.remove('checkHighlight');
    square.classList.remove('checkMateHighlight');
  })
  checkSquare = null;
  startSquareHighlight = null;
  endSquareHighlight = null;
}
