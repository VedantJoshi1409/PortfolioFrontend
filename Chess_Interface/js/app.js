document.querySelector("#start-menu").style.visibility = "visible";
document.querySelector("#start-menu").style.opacity = "1";

const sessionId = startSession()
let baseUrl

async function startSession() {
  try {
    const response = await fetch('api_endpoint', {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log("Session started");
    const data = await response.text(); // or response.text() if the response is not JSON
    let session = data.toString()

    baseUrl = 'api_endpoint' + session + '&command='
    await fetch(baseUrl + 'uci', {
      method: 'GET',
    });

    await fetch(baseUrl + 'ucinewgame', {
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

let currentPlayer = true;
let player, wtime, btime, inc;
let lastMoveTime;
let wClock = document.querySelector("#white-clock"), bClock = document.querySelector("#black-clock");
let squares = document.querySelectorAll(".square"), pieces = document.querySelectorAll(".piece");
let legalMoves;
let positionCommand = "position startpos";

document.querySelector("#start-button").addEventListener("click", () => {
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
    for (let i = 0; i < 64; i++) {
      squares[i].style.top = Math.floor(i / 8) * 50 + "px";
      squares[i].style.left = Math.floor(i % 8) * 50 + "px";
    }
    wClock.style.top = '455px';
    bClock.style.top = '-27px';

    legalMoves = ['a2a4', 'a2a3', 'b2b4', 'b2b3', 'c2c4', 'c2c3', 'd2d4', 'd2d3', 'e2e4', 'e2e3', 'f2f4', 'f2f3', 'g2g4', 'g2g3', 'h2h4', 'h2h3', 'b1a3', 'b1c3', 'g1f3', 'g1h3'];
  } else {
    for (let i = 0; i < 64; i++) {
      squares[i].style.top = (7 - Math.floor(i / 8)) * 50 + "px";
      squares[i].style.left = Math.floor(i % 8) * 50 + "px";
    }

    wClock.style.top = '-27px';
    bClock.style.top = '455px';
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

  lastMoveTime = Date.now()
  let timeSinceLastMove = Date.now() - lastMoveTime;
  wClock.innerHTML = `${Math.floor((wtime - timeSinceLastMove) / 60000)}:${(((wtime - timeSinceLastMove) / 1000) % 60).toFixed(1).toString().padStart(4, '0')}`;
  bClock.innerHTML = `${Math.floor((btime - timeSinceLastMove) / 60000)}:${(((btime - timeSinceLastMove) / 1000) % 60).toFixed(1).toString().padStart(4, '0')}`;
  startTicking();

  menu.style.display = "none";
  menu.style.visibility = "hidden";
  menu.style.opacity = "0";

  game.style.opacity = "1";
  game.style.visibility = "visible";
  game.style.display = "flex";
})
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

function startTicking() {
  let timeSinceLastMove = Date.now() - lastMoveTime;
  if (currentPlayer) {
    wClock.innerHTML = `${Math.floor((wtime - timeSinceLastMove) / 60000)}:${(((wtime - timeSinceLastMove) / 1000) % 60).toFixed(1).toString().padStart(4, '0')}`;
  } else {
    bClock.innerHTML = `${Math.floor((btime - timeSinceLastMove) / 60000)}:${(((btime - timeSinceLastMove) / 1000) % 60).toFixed(1).toString().padStart(4, '0')}`;
  }
  requestAnimationFrame(startTicking);
}

let beingDragged;
let startSquare;
let endSquares;

function dragStart(e) {
  beingDragged = e.target;
  if (currentPlayer === player) {
    startSquare = beingDragged.parentElement.parentElement.getAttribute("data-position");
    endSquares = getMoves(startSquare);
    highlightMoves(endSquares)
  }
}

function dragOver(e) {
  e.preventDefault()
}

function dragDrop(e) {
  let end = e.target;
  if (endSquares.includes(end.getAttribute("data-position"))) {
    end.appendChild(beingDragged);
    addToHistory(startSquare + end.getAttribute("data-position"));
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
      moves.push(legalMoves[i].substring(2));
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
  await fetch(baseUrl + positionCommand, {
    method: 'GET',
  });

  let response = await fetch(baseUrl + `go wtime ${wtime} btime ${btime} winc ${inc} binc ${inc}`, {
    method: 'GET',
  });
  const data = await response.text();
  let temp = data.split("\n");
  let moves = temp[0].split(" ");
  legalMoves = []
  for (let i = 1; i < moves.length; i++) {
    legalMoves.push(moves[i]);
  }
  console.log(legalMoves);
  let bestmove = temp[1].split(" ")[1];
  let piece = document.querySelector(`[data-position="${bestmove.substring(0, 2)}"]`).firstChild;
  document.querySelector(`[data-position="${bestmove.substring(2)}"]`).appendChild(piece);
  addToHistory(bestmove)
  currentPlayer = !currentPlayer;
}
