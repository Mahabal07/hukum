const suits = ['Clubs', 'Diamonds', 'Spades', 'Hearts'];
const values = ['7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
let hands = [[], [], [], []]; // Player hands
let currentRound = 1;
let currentPlayer = 0;
let hukumSuit = '';
let deck = [];
let cardsOnTable = []; // To track cards played on the table
let teamAScore = 0;
let teamBScore = 0;

// Function to create deck with images
function createDeck() {
    let deck = [];
    suits.forEach(suit => {
        values.forEach(value => {
            let cardImage = `/cards/${suit.toLowerCase()}/${value}.webp`;
            deck.push({ suit, value, image: cardImage });
        });
    });
    return deck;
}

// Function to shuffle and deal cards
function shuffleAndDeal() {
    deck = createDeck();
    deck.sort(() => Math.random() - 0.5); // Shuffle

    // Deal 8 cards to each player
    hands.forEach((hand, index) => {
        hands[index] = deck.splice(0, 8);
    });
    updateGameBoard();
    document.getElementById('round-info').textContent = `Round ${currentRound}: Select your Hukum!`;
    showHukumSelection();
}

// Function to start the game after selecting Hukum
function startGame() {
    // Remove shuffle button
    document.getElementById('shuffle-btn').classList.add('hidden');
    document.getElementById('round-info').textContent = `Round ${currentRound}: Player 1, it's your turn!`;
    highlightCurrentPlayer();
}

// Function to highlight the current player
function highlightCurrentPlayer() {
    // Remove highlight from all players
    document.querySelectorAll('.player-hand').forEach(hand => {
        hand.classList.remove('bg-yellow-500');
    });

    // Highlight the current player
    const currentPlayerHand = document.querySelector(`#player-${currentPlayer + 1} .player-hand`);
    currentPlayerHand.classList.add('bg-yellow-500');
}

// Function to show Hukum selection
function showHukumSelection() {
    document.getElementById('hukum-selection').classList.remove('hidden');
    document.querySelectorAll('.hukum-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            hukumSuit = e.target.textContent;
            document.getElementById('round-info').textContent = `Hukum selected: ${hukumSuit}. Game starts!`;
            document.getElementById('hukum-selection').classList.add('hidden');
            startGame(); // Start the game after Hukum is selected
        });
    });
}

// Function to render player hands
function updateGameBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // Clear the board

    hands.forEach((hand, playerIndex) => {
        const playerDiv = document.createElement('div');
        playerDiv.id = `player-${playerIndex + 1}`;
        playerDiv.className = 'player-hand p-4 bg-white rounded shadow-lg flex flex-col items-center';

        const playerTitle = document.createElement('h3');
        playerTitle.className = 'text-center font-bold mb-4';
        playerTitle.textContent = `Player ${playerIndex + 1}`;

        const handDiv = document.createElement('div');
        handDiv.className = 'grid grid-cols-4 gap-2';

        hand.forEach((card, cardIndex) => {
            const cardImg = document.createElement('img');
            cardImg.src = card.image;
            cardImg.alt = `${card.value} of ${card.suit}`;
            cardImg.className = 'w-24 h-32 transition-transform transform hover:scale-105';
            cardImg.addEventListener('click', () => {
                if (playerIndex === currentPlayer) {
                    playerPlaysCard(cardIndex); // Only allow current player to play a card
                }
            });
            handDiv.appendChild(cardImg);
        });

        playerDiv.appendChild(playerTitle);
        playerDiv.appendChild(handDiv);
        gameBoard.appendChild(playerDiv);
    });
}

// Function to handle card selection and move it to the middle
function playerPlaysCard(cardIndex) {
    const playedCard = hands[currentPlayer][cardIndex];
    hands[currentPlayer].splice(cardIndex, 1); // Remove card from hand
    cardsOnTable.push({ player: currentPlayer, card: playedCard });

    // Update game board and animate card to the middle
    updateGameBoard();
    moveCardToTable(playedCard);

    // Check if the round is complete (all 4 players have played)
    if (cardsOnTable.length === 4) {
        setTimeout(() => {
            declareRoundWinner(); // Declare the winner of the round
            clearTable(); // Clear the table for the next round
        }, 1000); // Add a short delay before declaring winner
    } else {
        // Move to next player
        currentPlayer = (currentPlayer + 1) % 4; // Cycle between players 0-3
        document.getElementById('round-info').textContent = `Player ${currentPlayer + 1}'s turn!`;
        highlightCurrentPlayer();
    }
}

// Function to move a card to the table (animate card to center)
function moveCardToTable(card) {
    const middleTable = document.getElementById('middle-table');
    const cardImg = document.createElement('img');
    cardImg.src = card.image;
    cardImg.alt = `${card.value} of ${card.suit}`;
    cardImg.className = 'w-24 h-32 transition-transform transform scale-0';

    // Append card to the table and animate it
    middleTable.appendChild(cardImg);
    setTimeout(() => {
        cardImg.classList.remove('scale-0');
        cardImg.classList.add('scale-100');
    }, 100); // Add a delay for the animation
}

// Function to declare the winner of the round
function declareRoundWinner() {
    // Compare the cards on the table and determine the round winner
    let winningPlayer = cardsOnTable[0].player; // Assume first player's card is the highest
    let highestCard = cardsOnTable[0].card;

    cardsOnTable.forEach(({ player, card }) => {
        if (compareCards(card, highestCard)) {
            highestCard = card;
            winningPlayer = player;
        }
    });

    // Determine which team won the round (Team A: Player 1 and Player 3, Team B: Player 2 and Player 4)
    const winningTeam = winningPlayer % 2 === 0 ? 'A' : 'B';
    if (winningTeam === 'A') {
        teamAScore++;
    } else {
        teamBScore++;
    }

    // Update scores and check if there's a game winner
    updateScores();
    checkForGameWinner();
}

// Function to compare two cards (you can add your game-specific logic here)
function compareCards(card1, card2) {
    // Add custom logic for comparing cards (e.g., based on value or suit)
    const cardValueOrder = values;
    const value1 = cardValueOrder.indexOf(card1.value);
    const value2 = cardValueOrder.indexOf(card2.value);

    return value1 > value2; // Return true if card1 is higher
}

// Function to update scores
function updateScores() {
    document.getElementById('team-a-score').textContent = `Team A: ${teamAScore}`;
    document.getElementById('team-b-score').textContent = `Team B: ${teamBScore}`;
}

// Function to clear the table
function clearTable() {
    const middleTable = document.getElementById('middle-table');
    middleTable.innerHTML = ''; // Clear the middle table
    cardsOnTable = []; // Reset cards on the table
    currentPlayer = 0; // Reset to Player 1
}

// Function to check for the game winner
function checkForGameWinner() {
    if (teamAScore === 5 || teamBScore === 5) {
        const winningTeam = teamAScore === 5 ? 'A' : 'B';
        document.getElementById('round-info').textContent = `Team ${winningTeam} wins the game!`;

        // Show restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Game';
        restartButton.className = 'px-6 py-3 bg-red-500 text-white font-semibold rounded hover:bg-red-700 transition-all mt-4';
        restartButton.addEventListener('click', restartGame);
        document.querySelector('.container').appendChild(restartButton);
    } else {
        currentRound++;
        shuffleAndDeal(); // Shuffle and deal new cards for the next round
    }
}

// Function to restart the game
function restartGame() {
    currentRound = 1;
    teamAScore = 0;
    teamBScore = 0;

    // Reset UI
    document.getElementById('shuffle-btn').classList.remove('hidden');
    document.getElementById('round-info').textContent = 'Shuffle and deal to start!';
    updateScores();
    clearTable();

    // Remove restart button
    const restartButton = document.querySelector('.container button');
    if (restartButton) restartButton.remove();
}

// Game Initialization
document.getElementById('shuffle-btn').addEventListener('click', () => {
    shuffleAndDeal();
});
