document.addEventListener('DOMContentLoaded', () => {
  const userGrid = document.querySelector('.grid-user')
  const computerGrid = document.querySelector('.grid-computer')
  const displayGrid = document.querySelector('.grid-display')
  const ships = document.querySelectorAll('.ship')
  const startButton = document.querySelector('#start')
  const turnDisplay = document.querySelector('#turn')
  const infoDisplay = document.querySelector('#info')
  const restartButton = document.getElementById('restart')
  const userSquares = []
  const computerSquares = []
  let horizontal = true
  let GameOver = false
  let currentPlayer = 'user'
  const width = 10


function generateBoard(grid, squares) {
  for (let i = 0; i < width * width; i++) {
    const square = document.createElement('div');
    square.dataset.id = i;
    grid.appendChild(square);
    squares.push(square);
  }
}

generateBoard(userGrid, userSquares);
generateBoard(computerGrid, computerSquares);

//All the ships implemented 
const shipArray = [
  { name: 'destroyer', directions: [[0, 1], [0, width]] },
  { name: 'submarine', directions: [[0, 1, 2], [0, width, width * 2]] },
  { name: 'cruiser', directions: [[0, 1, 2], [0, width, width * 2]] },
  { name: 'battleship', directions: [[0, 1, 2, 3], [0, width, width * 2, width * 3]] },
  { name: 'carrier', directions: [[0, 1, 2, 3, 4], [0, width, width * 2, width * 3, width * 4]] },
];


//Funtion used to hid the computer ships on the grid
function handleComputerShipClick(square) {
    if (square.classList.contains('hidden')) {
        square.classList.remove('hidden'); 
        square.classList.add('computer-ship-hit'); 
  }
}

//Funtion to randomly place ships on computer grid
function create(ship) {
  let randomDirection = Math.floor(Math.random() * ship.directions.length);
  let current = ship.directions[randomDirection];
  let direction = (randomDirection === 0) ? 1 : 10;
  let randomStart = Math.abs(Math.floor(Math.random() * (computerSquares.length - (ship.directions[0].length * direction)))); // This is to ensure the randomStart is within the grid bounds

  const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken') || userSquares[randomStart + index].classList.contains('taken'));
  const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1);
  const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0);

  if (!isTaken && !isAtRightEdge && !isAtLeftEdge) {
      current.forEach(index => {
          computerSquares[randomStart + index].classList.add('taken', ship.name, 'hidden'); //To hid the ships for the player
          computerSquares[randomStart + index].addEventListener('click', () => {
              handleComputerShipClick(computerSquares[randomStart + index]);
          });
      });
  } else {
      create(ship);
  }
}
//Placing the ships on the computer side grid
create(shipArray[0]);
create(shipArray[1]);
create(shipArray[2]);
create(shipArray[3]);
create(shipArray[4]);


ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
userSquares.forEach(square => square.addEventListener('dragover', dragOver))
userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
userSquares.forEach(square => square.addEventListener('drop', dragShip))
userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

  let selectedShipNameWithIndex
  let draggedShip
  let draggedShipLength

  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id
    console.log(selectedShipNameWithIndex)
  }))

  function dragStart() {
    draggedShip = this
    draggedShipLength = this.childNodes.length
    console.log(draggedShip)
  }

  function dragOver(e) {
    e.preventDefault()
  }

  function dragEnter(e) {
    e.preventDefault()
  }

  function dragLeave() {
    console.log('drag leave')
  }

  //Function using to enable ships to be dragged to the player grid
  function dragShip() {
    const shipName = draggedShip.lastChild.id;
    const shipClass = shipName.slice(0, -2);
    const shipIndex = parseInt(shipName.substr(-1));
    let shipLast = shipIndex + parseInt(this.dataset.id);
    
    const selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1));
    shipLast -= selectedShipIndex;
  
    //Used to check if there a ship currently on the squares you want to place another ship, it will not all two ships to overlap
    if (horizontal) {
      for (let i = 0; i < draggedShipLength; i++) {
        const targetSquare = userSquares[parseInt(this.dataset.id) - selectedShipIndex + i];
        if (targetSquare.classList.contains('taken')) {
          return; 
        }
      }
      for (let i = 0; i < draggedShipLength; i++) {
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', shipClass);
      }
    } 
    displayGrid.removeChild(draggedShip);
  }
  
  function dragEnd() {
    console.log('dragend');
  }
  
//Function of the main logic of the game, this is a turn ny turn gameplay
function play() {
  //Used to check if there are currently any ships on the board, you can not play the game without atleast placing one ship
  if (!shipsPlaced()) {
    alert('There is no ship placed on the grid.');
    return;
  }
    if (GameOver) return
    if (currentPlayer === 'user') {
      turnDisplay.innerHTML = 'Player Turn'
      computerSquares.forEach(square => square.addEventListener('click', function (e) {
        click(square)
      }))
    }
    if (currentPlayer === 'computer') {
      turnDisplay.innerHTML = 'Computer Turn'
      setTimeout(computerturn, 1000)
    }
}
startButton.addEventListener('click', play)

//Function to determine atleast one ship is placed on the player's grid to start playing 
function shipsPlaced() {
  return Array.from(userSquares).some(square => square.classList.contains('taken'));
}

//Function to restart the game
function restartGame() {
  location.reload();
}
restartButton.addEventListener('click', restartGame);

  let destroyerCount = 0
  let submarineCount = 0
  let cruiserCount = 0
  let battleshipCount = 0
  let carrierCount = 0
  let playerHits = 0;
  let playerMisses = 0;

  
//Function used to determine number of ships destroyed on the computer's grid
  function click(square) {
    //Used to determine when the game is over, the player can not bomb the computer's grid once the game is over
    if (GameOver) {
      alert('The game is over.');
      return;
    }
    //Used to determine which squares have already been clicked, so the player does not click it again
    if (square.classList.contains('boom') || square.classList.contains('miss')) {
      alert("This location has already been clicked. Please select another location.");
      return; 
    }
  
    //Used to determine the all destroyed ships on the computer's grid
    if (!square.classList.contains('boom')) {
      if (square.classList.contains('destroyer')) {
        destroyerCount++;
      } else if (square.classList.contains('submarine')) {
        submarineCount++;
      } else if (square.classList.contains('cruiser')) {
        cruiserCount++;
      } else if (square.classList.contains('battleship')) {
        battleshipCount++;
      } else if (square.classList.contains('carrier')) {
        carrierCount++;
      }
    //Used to count the number of playerHits and playerMisses
      if (square.classList.contains('taken')) {
        square.classList.add('boom');
        playerHits++;
      } else {
        square.classList.add('miss');
        playerMisses++;
      }
    }
  
    winner();
    currentPlayer = 'computer';
    play(); 
    updateHitMissCount();
  }
  

  let computerDestroyerCount = 0
  let computerSubmarineCount = 0
  let computerCruiserCount = 0
  let computerBattleshipCount = 0
  let computerCarrierCount = 0
  let computerHits = 0;
  let computerMisses = 0;

//Function used to determine the number of ships destroyed on the player's grid
  function computerturn() {
    let random = getRandomIndex(userSquares);
    let square = userSquares[random];

   //Used to count the number of computerHits and computerMisses
    if (!square.classList.contains('boom')) {
        if (square.classList.contains('taken')) {
            square.classList.add('boom');
            updateCounts(square);
            computerHits++;
        } else {
            square.classList.add('miss');
            computerMisses++;
        }
        updateHitMissCount();
        winner();
    } else {
        computerturn();
    }
    currentPlayer = 'user';
    turnDisplay.innerHTML = 'Player Turn';
}

function getRandomIndex(squaresArray) {
    return Math.floor(Math.random() * squaresArray.length);
}

//Function to determine the number of destroyed ships on the player's grid
function updateCounts(square) {
    if (square.classList.contains('destroyer')) computerDestroyerCount++;
    if (square.classList.contains('submarine')) computerSubmarineCount++;
    if (square.classList.contains('cruiser')) computerCruiserCount++;
    if (square.classList.contains('battleship')) computerBattleshipCount++;
    if (square.classList.contains('carrier')) computerCarrierCount++;
}

//Function to update the playerHits, playerMisses, computerHits, computerMisses
function updateHitMissCount() {
    document.getElementById('playerHits').innerHTML = playerHits;
    document.getElementById('playerMisses').innerHTML = playerMisses;
    document.getElementById('computerHits').innerHTML = computerHits;
    document.getElementById('computerMisses').innerHTML = computerMisses;
}

//Function to determine the winner of the game by assigning points to each ship and deciding the winner by maximum points
function winner() {
  infoDisplay.style.cssText = `
    font-family: 'Arial', sans-serif;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    padding: 20px;
    margin-top: 20px;
    color: white;
    background-color: black;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transition: background-color 0.3s, color 0.3s, transform 0.2s;
  `;

  const playerShipSunk = destroyerCount === 10 && submarineCount === 10 && cruiserCount === 10 && battleshipCount === 10 && carrierCount === 10;
  const computerShipSunk = computerDestroyerCount === 10 && computerSubmarineCount === 10 && computerCruiserCount === 10 && computerBattleshipCount === 10 && computerCarrierCount === 10;

  //If either the player or computer wins it is redirected to gameOver
  if (playerShipSunk) {
    infoDisplay.innerHTML = 'PLAYER WINS';
    gameOver();
  } else if (computerShipSunk) {
    infoDisplay.innerHTML = 'COMPUTER WINS';
    gameOver();
  } else {
    //This is used to check and update ship status
    const updateShipStatus = (ship, computerShip, sunkCount) => {
      if (ship === sunkCount) {
        infoDisplay.innerHTML = `Player sunk the computer's ${computerShip}`;
        return 10;
      }
      return ship;
    };

    //This is to update player ships
    destroyerCount = updateShipStatus(destroyerCount, 'destroyer', 2);
    submarineCount = updateShipStatus(submarineCount, 'submarine', 3);
    cruiserCount = updateShipStatus(cruiserCount, 'cruiser', 3);
    battleshipCount = updateShipStatus(battleshipCount, 'battleship', 4);
    carrierCount = updateShipStatus(carrierCount, 'carrier', 5);

    //This is to update computer ships
    computerDestroyerCount = updateShipStatus(computerDestroyerCount, 'Destroyer', 2);
    computerSubmarineCount = updateShipStatus(computerSubmarineCount, 'Submarine', 3);
    computerCruiserCount = updateShipStatus(computerCruiserCount, 'Cruiser', 3);
    computerBattleshipCount = updateShipStatus(computerBattleshipCount, 'Battleship', 4);
    computerCarrierCount = updateShipStatus(computerCarrierCount, 'Carrier', 5);
  }
}
  //Function is to indicate the game is over either the computer won
  function gameOver() {
    GameOver = true
    startButton.removeEventListener('click', play)
  }
})
