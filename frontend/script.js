const suits = ['Clubs', 'Diamonds', 'Spades', 'Hearts'];
const values = ['7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
let hands = [[], [], [], []];
let currentRound = 1;
let currentPlayer = 0;
let hukumSuit = '';
let deck = [];
let cardsOnTable = [];
let teamAScore = 0;
let teamBScore = 0;
let startingSuit = '';
let hukumSelected = false;

function createDeck() {
    let deck = [];
    suits.forEach(suit => {
        values.forEach(value => {
            let cardImage = `cards/${suit.toLowerCase()}/${value}.webp`;
            deck.push({ suit, value, image: cardImage });
        });
    });
    return deck;
}

function shuffleAndDeal() {
    deck = createDeck();
    deck.sort(() => Math.random() - 0.5);

    hands.forEach((hand, index) => {
        hands[index] = deck.splice(0, 4);
    });

    updateGameBoard();
    document.getElementById('round-info').textContent = `Round ${currentRound}: Select your Hukum!`;
    showHukumSelection();
}

function distributeRemainingCards() {
    hands.forEach((hand, index) => {
        hands[index] = hands[index].concat(deck.splice(0, 4));
    });
    updateGameBoard();
    document.getElementById('round-info').textContent = `Round ${currentRound}: Player ${currentPlayer + 1}, it's your turn!`;
    highlightCurrentPlayer();
}

function startGame() {
    hukumSelected = true;
    document.getElementById('hukum-selection').classList.add('hidden');
    distributeRemainingCards();
}

function highlightCurrentPlayer() {
    document.querySelectorAll('.player-hand').forEach(hand => {
        hand.classList.remove('bg-yellow-500');
    });
    document.querySelector(`#player-${currentPlayer + 1}`).classList.add('bg-yellow-500');
}

function showHukumSelection() {
    const hukumSelectionDiv = document.getElementById('hukum-selection');
    hukumSelectionDiv.innerHTML = ''; // Clear previous buttons
    hukumSelectionDiv.classList.remove('hidden');

    suits.forEach(suit => {
        const suitButton = document.createElement('button');
        suitButton.textContent = suit;
        suitButton.className = 'hukum-btn px-4 py-2 bg-blue-500 text-white rounded m-2';
        suitButton.addEventListener('click', () => {
            hukumSuit = suit.toLowerCase();
            document.getElementById('round-info').textContent = `Hukum selected: ${suit}. Game starts!`;
            startGame();
        });
        hukumSelectionDiv.appendChild(suitButton);
    });
}

function updateGameBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

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

            // Only apply glow/dim effects for the current player
            if (playerIndex === currentPlayer && hukumSelected) {
                // Remove any existing glow/dim classes first
                cardImg.classList.remove('glow-card', 'dim-card');
                
                if (startingSuit) {
                    const hasStartingSuit = hands[currentPlayer].some(c => 
                        c.suit.toLowerCase() === startingSuit.toLowerCase()
                    );
                    
                    if (hasStartingSuit) {
                        // If player has starting suit, only allow those cards
                        if (card.suit.toLowerCase() === startingSuit.toLowerCase()) {
                            cardImg.classList.add('glow-card');
                        } else {
                            cardImg.classList.add('dim-card');
                        }
                    } else {
                        // If player doesn't have starting suit, all cards are valid
                        cardImg.classList.add('glow-card');
                    }
                } else {
                    // If it's the first card of the round, all cards are valid
                    cardImg.classList.add('glow-card');
                }
            }

            cardImg.addEventListener('click', () => {
                if (playerIndex === currentPlayer && hukumSelected) {
                    if (canPlayCard(card)) {
                        playerPlaysCard(cardIndex);
                    }
                }
            });

            handDiv.appendChild(cardImg);
        });

        playerDiv.appendChild(playerTitle);
        playerDiv.appendChild(handDiv);
        gameBoard.appendChild(playerDiv);
    });

    highlightCurrentPlayer();
}

function canPlayCard(card) {
    if (cardsOnTable.length === 0) {
        return true;
    }
    
    const playerHasStartingSuit = hands[currentPlayer].some(c => 
        c.suit.toLowerCase() === startingSuit.toLowerCase()
    );
    
    if (playerHasStartingSuit) {
        return card.suit.toLowerCase() === startingSuit.toLowerCase();
    }
    return true;
}

function playerPlaysCard(cardIndex) {
    const playedCard = hands[currentPlayer][cardIndex];
    hands[currentPlayer].splice(cardIndex, 1);
    cardsOnTable.push({ player: currentPlayer, card: playedCard });

    if (cardsOnTable.length === 1) {
        startingSuit = playedCard.suit.toLowerCase();
    }

    // Move to next player before updating the game board
    currentPlayer = (currentPlayer + 1) % 4;
    
    moveCardToTable(playedCard);
    updateGameBoard(); // This will now show highlighting for the next player

    if (cardsOnTable.length === 4) {
        setTimeout(() => {
            const winningPlayer = declareRoundWinner();
            clearTable();
            currentPlayer = winningPlayer; // Set the next starting player to the round winner
            startingSuit = ''; // Reset starting suit for the new round
            updateGameBoard();
        }, 1000);
    }
}

function moveCardToTable(card) {
    const middleTable = document.getElementById('middle-table');
    const cardImg = document.createElement('img');
    cardImg.src = card.image;
    cardImg.alt = `${card.value} of ${card.suit}`;
    cardImg.className = 'w-32 h-48 transition-transform transform';
    middleTable.appendChild(cardImg);

    setTimeout(() => {
        cardImg.classList.add('scale-125');
        setTimeout(() => {
            cardImg.classList.remove('scale-125');
        }, 200);
    }, 100);
}

function declareRoundWinner() {
    const winningIndex = determineRoundWinner();
    const winningTeam = winningIndex % 2 === 0 ? 'A' : 'B';
    if (winningTeam === 'A') {
        teamAScore++;
    } else {
        teamBScore++;
    }

    const roundInfo = document.getElementById('round-info');
    roundInfo.textContent = `Player ${winningIndex + 1} (Team ${winningTeam}) wins this round!`;
    roundInfo.classList.add('animate-bounce');
    setTimeout(() => {
        roundInfo.classList.remove('animate-bounce');
    }, 1000);

    updateScores();
    checkForGameWinner();
    return winningIndex; // Return the winning player index
}

function determineRoundWinner() {
    const cardPriority = {'7': 0, '8': 1, '9': 2, '10': 3, 'Jack': 4, 'Queen': 5, 'King': 6, 'Ace': 7};

    function calculatePriority(card) {
        if (card.suit.toLowerCase() === hukumSuit) {
            return 16 + cardPriority[card.value];
        } else if (card.suit.toLowerCase() === startingSuit.toLowerCase()) {
            return 8 + cardPriority[card.value];
        } else {
            return cardPriority[card.value];
        }
    }

    cardsOnTable.sort((a, b) => calculatePriority(b.card) - calculatePriority(a.card));
    return cardsOnTable[0].player;
}

function clearTable() {
    document.getElementById('middle-table').innerHTML = '';
    cardsOnTable = [];
}

function updateScores() {
    document.getElementById('team-a-score').textContent = `Team A: ${teamAScore}`;
    document.getElementById('team-b-score').textContent = `Team B: ${teamBScore}`;
}

function checkForGameWinner() {
    if (teamAScore === 5 || teamBScore === 5) {
        const winningTeam = teamAScore === 5 ? 'A' : 'B';
        document.getElementById('round-info').textContent = `Team ${winningTeam} wins the game!`;
        document.getElementById('round-info').classList.add('animate-ping');

        setTimeout(() => {
            location.reload();
        }, 3000);
    }
}

// Game Initialization
shuffleAndDeal();