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
let startingSuit = ''; // Suit of the first played card in each round
let hukumSelected = false;

// Function to create deck with images
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

// Function to shuffle and deal cards (first 4 cards each)
function shuffleAndDeal() {
    deck = createDeck();
    deck.sort(() => Math.random() - 0.5); // Shuffle

    // Deal 4 cards to each player initially
    hands.forEach((hand, index) => {
        hands[index] = deck.splice(0, 4); // Deal 4 cards to each player
    });

    updateGameBoard();
    document.getElementById('round-info').textContent = `Round ${currentRound}: Select your Hukum!`;
    showHukumSelection();
}

// Function to distribute remaining 4 cards after Hukum is chosen
function distributeRemainingCards() {
    hands.forEach((hand, index) => {
        hands[index] = hands[index].concat(deck.splice(0, 4)); // Deal the remaining 4 cards to each player
    });
    updateGameBoard();
    document.getElementById('round-info').textContent = `Round ${currentRound}: Player 1, it's your turn!`;
    highlightCurrentPlayer();
}

// Function to start the game after selecting Hukum
function startGame() {
    hukumSelected = true;
    document.getElementById('hukum-selection').classList.add('hidden');
    distributeRemainingCards(); // Distribute remaining 4 cards after Hukum
}

// Function to highlight the current player
function highlightCurrentPlayer() {
    document.querySelectorAll('.player-hand').forEach(hand => {
        hand.classList.remove('bg-yellow-500');
    });
    document.querySelector(`#player-${currentPlayer + 1}`).classList.add('bg-yellow-500');
}

// Function to show Hukum selection
function showHukumSelection() {
    const hukumSelectionDiv = document.getElementById('hukum-selection');
    hukumSelectionDiv.classList.remove('hidden');

    suits.forEach(suit => {
        const suitButton = document.createElement('button');
        suitButton.textContent = suit;
        suitButton.className = 'hukum-btn px-4 py-2 bg-blue-500 text-white rounded m-2';
        suitButton.addEventListener('click', () => {
            hukumSuit = suit.toLowerCase(); // Store Hukum suit in lowercase
            document.getElementById('round-info').textContent = `Hukum selected: ${hukumSuit}. Game starts!`;
            startGame(); // Start the game after Hukum is selected
        });
        hukumSelectionDiv.appendChild(suitButton);
    });
}

// Function to render player hands and handle card highlighting based on starting suit
// Function to render player hands and handle card highlighting based on starting suit
// Function to render player hands and handle card highlighting based on starting suit
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

            // Apply glow/dim logic only for players 2, 3, and 4 (currentPlayer !== 0)
            if (playerIndex === currentPlayer && hukumSelected) {
                if (startingSuit) {
                    if (card.suit.toLowerCase() === startingSuit.toLowerCase()) {
                        cardImg.classList.add('glow-card');  // Highlight cards that match the starting suit
                        cardImg.classList.remove('dim-card'); // Ensure non-dimmed
                    } else {
                        cardImg.classList.add('dim-card');   // Dim cards not matching the starting suit
                        cardImg.classList.remove('glow-card'); // Ensure non-highlighted
                    }
                }
            } else {
                // Ensure no glow/dim effects when it's not the player's turn
                cardImg.classList.remove('glow-card', 'dim-card');
            }

            // Allow card selection only for the current player
            cardImg.addEventListener('click', () => {
                if (playerIndex === currentPlayer && hukumSelected) {
                    if (canPlayCard(card)) {
                        playerPlaysCard(cardIndex);
                        resetGlowAndDimEffects(); // Reset the glow and dim effects after card is played
                    }
                }
            });

            handDiv.appendChild(cardImg);
        });

        playerDiv.appendChild(playerTitle);
        playerDiv.appendChild(handDiv);
        gameBoard.appendChild(playerDiv);
    });
}

// Function to reset glow and dim effects for all players' hands after a card is played
function resetGlowAndDimEffects() {
    document.querySelectorAll('.glow-card').forEach(card => {
        card.classList.remove('glow-card');
    });
    document.querySelectorAll('.dim-card').forEach(card => {
        card.classList.remove('dim-card');
    });
}



// Function to check if a card can be played
function canPlayCard(card) {
    if (cardsOnTable.length === 0) {
        // First card of the round can be any card
        return true;
    } else {
        // If the player has a card matching the starting suit, they must play it
        const playerHasStartingSuit = hands[currentPlayer].some(c => c.suit.toLowerCase() === startingSuit.toLowerCase());
        if (playerHasStartingSuit) {
            return card.suit.toLowerCase() === startingSuit.toLowerCase();
        } else {
            // If no matching suit, the player can play any card
            return true;
        }
    }
}

// Function to handle card selection and move it to the middle
function playerPlaysCard(cardIndex) {
    const playedCard = hands[currentPlayer][cardIndex];
    hands[currentPlayer].splice(cardIndex, 1); // Remove card from hand
    cardsOnTable.push({ player: currentPlayer, card: playedCard });

    if (cardsOnTable.length === 1) {
        startingSuit = playedCard.suit.toLowerCase(); // Set starting suit for the round
    }

    updateGameBoard();
    moveCardToTable(playedCard);

    if (cardsOnTable.length === 4) {
        setTimeout(() => {
            declareRoundWinner(); // Declare the winner of the round
            clearTable(); // Clear the table for the next round
        }, 1000); // Add a short delay before declaring winner
    } else {
        // Move to next player
        currentPlayer = (currentPlayer + 1) % 4;
        highlightCurrentPlayer(); // Highlight the next player
    }
}

// Function to move card to the middle table
function moveCardToTable(card) {
    const middleTable = document.getElementById('middle-table');
    const cardImg = document.createElement('img');
    cardImg.src = card.image;
    cardImg.alt = `${card.value} of ${card.suit}`;
    cardImg.className = 'w-32 h-48 transition-transform transform';
    middleTable.appendChild(cardImg);

    // Animate card to table (basic animation)
    setTimeout(() => {
        cardImg.classList.add('scale-125'); // Scale up the card
        cardImg.classList.remove('scale-125'); // Scale it back
    }, 500);
}

// Function to declare round winner using the provided determine_winning_card logic
function declareRoundWinner() {
    const winningPlayer = determineRoundWinner();
    const winningTeam = winningPlayer % 2 === 0 ? 'A' : 'B';
    if (winningTeam === 'A') {
        teamAScore++;
    } else {
        teamBScore++;
    }

    // Small win animation for the round
    const roundInfo = document.getElementById('round-info');
    roundInfo.textContent = `Team ${winningTeam} wins this round!`;
    roundInfo.classList.add('animate-bounce');
    setTimeout(() => {
        roundInfo.classList.remove('animate-bounce');
    }, 1000);

    // Update scores and check if there's a game winner
    updateScores();
    checkForGameWinner();
}

// Logic to determine the winning card based on Hukum and starting suits
function determineRoundWinner() {
    const cardPriority = {'7': 0, '8': 1, '9': 2, '10': 3, 'Jack': 4, 'Queen': 5, 'King': 6, 'Ace': 7};

    // Function to calculate priority
    function calculatePriority(card) {
        if (card.suit.toLowerCase() === hukumSuit) {
            return 16 + cardPriority[card.value]; // Priority for Hukum suit
        } else if (card.suit.toLowerCase() === startingSuit.toLowerCase()) {
            return 8 + cardPriority[card.value]; // Priority for starting suit
        } else {
            return cardPriority[card.value]; // Priority for other suits
        }
    }

    // Sort cards on the table based on priority and return the highest priority card's player
    cardsOnTable.sort((a, b) => calculatePriority(b.card) - calculatePriority(a.card));
    return cardsOnTable[0].player;
}

// Function to clear the table after each round
function clearTable() {
    document.getElementById('middle-table').innerHTML = ''; // Clear the cards on the table
    cardsOnTable = [];
    currentPlayer = 0; // Player 1 starts the next round
    highlightCurrentPlayer();
}

// Function to update team scores
function updateScores() {
    document.getElementById('team-a-score').textContent = `Team A: ${teamAScore}`;
    document.getElementById('team-b-score').textContent = `Team B: ${teamBScore}`;
}

// Function to check if a team has won the game
function checkForGameWinner() {
    if (teamAScore === 5 || teamBScore === 5) {
        const winningTeam = teamAScore === 5 ? 'A' : 'B';

        // Show a big win animation for the game
        document.getElementById('round-info').textContent = `Team ${winningTeam} wins the game!`;
        document.getElementById('round-info').classList.add('animate-ping');

        // Restart the game after a few seconds or provide a button
        setTimeout(() => {
            location.reload(); // Restart the game by refreshing the page
        }, 3000); // Delay before restarting
    }
}

// Game Initialization
shuffleAndDeal(); // Start by shuffling and dealing cards             ```update the code to achieve  updated version that includes:

