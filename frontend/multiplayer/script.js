// Initialize Firebase with your config
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, set, get, update, onValue, remove } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDOj7wX2VznoBVzIvto2yzL7ZFVldQN1zE",
    authDomain: "hukum-c3925.firebaseapp.com",
    databaseURL: "https://hukum-c3925-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hukum-c3925",
    storageBucket: "hukum-c3925.appspot.com",
    messagingSenderId: "217599773757",
    appId: "1:217599773757:web:8842b2aaf647326ae36e54",
    measurementId: "G-8ZRD9P57H6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Game state variables
let gameId = null;
let playerId = null;
let playerName = null;
let playerPosition = null;
let gameRef = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const waitingRoom = document.getElementById('waiting-room');
const gameContainer = document.querySelector('.game-container');
const playerNameInput = document.getElementById('player-name');
const createGameBtn = document.getElementById('create-game');
const joinGameBtn = document.getElementById('join-game');
const gameCodeInput = document.getElementById('game-code');
const startGameBtn = document.getElementById('start-game');
const gameCodeDisplay = document.getElementById('game-code-display');
const playerList = document.getElementById('player-list');

// Event Listeners
createGameBtn.addEventListener('click', createGame);
joinGameBtn.addEventListener('click', joinGame);
startGameBtn.addEventListener('click', startGame);

// Create new game
async function createGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    // Generate unique game ID
    gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    playerId = Math.random().toString(36).substring(2, 15);
    playerPosition = 0; // Host is always player 0

    // Create game in Firebase
    const gameReference = ref(database, `games/${gameId}`);
    try {
        await set(gameReference, {
            status: 'waiting',
            players: {
                [playerId]: {
                    name: playerName,
                    position: playerPosition,
                    isHost: true
                }
            },
            currentPlayer: 0,
            hukumSuit: '',
            cardsOnTable: [],
            teamAScore: 0,
            teamBScore: 0
        });

        gameRef = gameReference;
        showWaitingRoom();
    } catch (error) {
        console.error('Error creating game:', error);
        alert('Failed to create game. Please try again.');
    }
}

// Join existing game
async function joinGame() {
    playerName = playerNameInput.value.trim();
    const code = gameCodeInput.value.trim().toUpperCase();
    
    if (!playerName || !code) {
        alert('Please enter your name and game code');
        return;
    }

    gameId = code;
    playerId = Math.random().toString(36).substring(2, 15);
    const gameReference = ref(database, `games/${gameId}`);

    try {
        const snapshot = await get(gameReference);
        const game = snapshot.val();

        if (!game) {
            alert('Game not found');
            return;
        }

        if (game.status !== 'waiting') {
            alert('Game already in progress');
            return;
        }

        const playerCount = Object.keys(game.players || {}).length;
        if (playerCount >= 4) {
            alert('Game is full');
            return;
        }

        playerPosition = playerCount;
        
        // Join game
        await update(ref(database, `games/${gameId}/players`), {
            [playerId]: {
                name: playerName,
                position: playerPosition,
                isHost: false
            }
        });

        gameRef = gameReference;
        showWaitingRoom();
    } catch (error) {
        console.error('Error joining game:', error);
        alert('Failed to join game. Please try again.');
    }
}

// Show waiting room
function showWaitingRoom() {
    loginScreen.style.display = 'none';
    waitingRoom.style.display = 'flex';
    gameCodeDisplay.textContent = gameId;

    // Listen for player updates
    onValue(ref(database, `games/${gameId}/players`), (snapshot) => {
        const players = snapshot.val();
        updatePlayerList(players);
        
        // Show start button only to host when 4 players have joined
        if (players[playerId]?.isHost) {
            startGameBtn.style.display = Object.keys(players).length === 4 ? 'block' : 'none';
        }
    });
}

// Update player list in waiting room
function updatePlayerList(players) {
    playerList.innerHTML = '';
    Object.values(players)
        .sort((a, b) => a.position - b.position)
        .forEach(player => {
            const div = document.createElement('div');
            div.className = 'py-2';
            div.textContent = `${player.name}${player.isHost ? ' (Host)' : ''}`;
            playerList.appendChild(div);
        });
}

// Handle disconnection
window.addEventListener('beforeunload', () => {
    if (gameRef && playerId) {
        remove(ref(database, `games/${gameId}/players/${playerId}`));
    }
});

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    loginScreen.style.display = 'flex';
    gameContainer.classList.add('hidden');
});


// Start the game
async function startGame() {
    const deck = createAndShuffleDeck();
    const hands = dealCards(deck);
    
    await gameRef.update({
        status: 'playing',
        deck: deck,
        hands: hands,
        currentPlayer: 0,
        startingSuit: '',
        cardsOnTable: []
    });

    showGameBoard();
}

// Create and shuffle deck
function createAndShuffleDeck() {
    const deck = [];
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({
                suit,
                value,
                image: `cards/${suit.toLowerCase()}/${value}.webp`
            });
        });
    });
    return deck.sort(() => Math.random() - 0.5);
}

// Deal cards
function dealCards(deck) {
    const hands = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
            hands[i].push(deck.pop());
        }
    }
    return hands;
}

// Show game board
function showGameBoard() {
    waitingRoom.style.display = 'none';
    gameContainer.classList.remove('hidden');

    // Listen for game state changes
    gameRef.on('value', (snapshot) => {
        const gameState = snapshot.val();
        updateGameBoard(gameState);
    });
}

// Update game board based on Firebase state
function updateGameBoard(gameState) {
    if (!gameState) return;

    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    // Render player hands
    gameState.hands.forEach((hand, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.id = `player-${index}`;
        playerDiv.className = `player-hand p-4 bg-white rounded shadow-lg flex flex-col items-center
            ${index === gameState.currentPlayer ? 'active-player' : ''}`;

        // Only show cards for current player's hand
        if (index === playerPosition) {
            const handDiv = document.createElement('div');
            handDiv.className = 'grid grid-cols-4 gap-2';

            hand.forEach((card, cardIndex) => {
                const cardImg = document.createElement('img');
                cardImg.src = card.image;
                cardImg.alt = `${card.value} of ${card.suit}`;
                cardImg.className = 'w-24 h-32 transition-transform transform hover:scale-105';

                if (gameState.currentPlayer === playerPosition) {
                    cardImg.addEventListener('click', () => playCard(cardIndex));
                }

                handDiv.appendChild(cardImg);
            });
            playerDiv.appendChild(handDiv);
        } else {
            // Show card backs for other players
            const cardBacks = document.createElement('div');
            cardBacks.className = 'grid grid-cols-4 gap-2';
            for (let i = 0; i < hand.length; i++) {
                const cardBack = document.createElement('img');
                cardBack.src = 'cards/back.webp';
                cardBack.className = 'w-24 h-32';
                cardBacks.appendChild(cardBack);
            }
            playerDiv.appendChild(cardBacks);
        }

        gameBoard.appendChild(playerDiv);
    });

    // Update middle table
    updateMiddleTable(gameState.cardsOnTable);

    // Update scores
    document.getElementById('team-a-score').textContent = `Team A: ${gameState.teamAScore}`;
    document.getElementById('team-b-score').textContent = `Team B: ${gameState.teamBScore}`;
}

// Play a card
async function playCard(cardIndex) {
    if (!gameRef) return;

    const gameSnapshot = await gameRef.once('value');
    const gameState = gameSnapshot.val();

    if (gameState.currentPlayer !== playerPosition) return;

    const hand = gameState.hands[playerPosition];
    const card = hand[cardIndex];

    // Remove card from hand
    hand.splice(cardIndex, 1);

    // Add card to table
    const cardsOnTable = [...gameState.cardsOnTable, { player: playerPosition, card }];

    // Update game state
    await gameRef.update({
        hands: gameState.hands,
        cardsOnTable,
        currentPlayer: (playerPosition + 1) % 4,
        startingSuit: cardsOnTable.length === 1 ? card.suit : gameState.startingSuit
    });

    // Check if round is complete
    if (cardsOnTable.length === 4) {
        setTimeout(() => resolveRound(), 1000);
    }
}

// Resolve round
async function resolveRound() {
    const gameSnapshot = await gameRef.once('value');
    const gameState = gameSnapshot.val();

    const winningPlayer = determineRoundWinner(gameState.cardsOnTable, gameState.hukumSuit);
    const winningTeam = winningPlayer % 2 === 0 ? 'A' : 'B';

    // Update scores
    const updates = {
        cardsOnTable: [],
        currentPlayer: winningPlayer,
        startingSuit: '',
        [`team${winningTeam}Score`]: gameState[`team${winningTeam}Score`] + 1
    };

    await gameRef.update(updates);

    // Check for game end
    if (updates[`team${winningTeam}Score`] === 5) {
        endGame(winningTeam);
    }
}

// ... (previous code remains the same)

// Determine round winner (continued)
function calculatePriority(card, startingSuit, hukumSuit) {
    if (card.suit.toLowerCase() === hukumSuit.toLowerCase()) {
        return 16 + cardPriority[card.value];
    } else if (card.suit.toLowerCase() === startingSuit.toLowerCase()) {
        return 8 + cardPriority[card.value];
    } else {
        return cardPriority[card.value];
    }
}

function determineRoundWinner(cardsOnTable, hukumSuit) {
    const startingSuit = cardsOnTable[0].card.suit;
    let highestPriority = -1;
    let winningPlayer = -1;

    cardsOnTable.forEach(({player, card}) => {
        const priority = calculatePriority(card, startingSuit, hukumSuit);
        if (priority > highestPriority) {
            highestPriority = priority;
            winningPlayer = player;
        }
    });

    return winningPlayer;
}

// Update middle table display
function updateMiddleTable(cardsOnTable) {
    const middleTable = document.getElementById('middle-table');
    middleTable.innerHTML = '';

    cardsOnTable.forEach(({card}) => {
        const cardImg = document.createElement('img');
        cardImg.src = card.image;
        cardImg.alt = `${card.value} of ${card.suit}`;
        cardImg.className = 'w-32 h-48 transition-transform transform card-played';
        cardImg.style.animation = 'playCard 0.5s ease-out, float 3s ease-in-out infinite';
        middleTable.appendChild(cardImg);
    });
}

// Handle Hukum selection
function showHukumSelection() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop animate__animated animate__fadeIn';
    
    const suitIcons = {
        'Hearts': '♥',
        'Diamonds': '♦',
        'Clubs': '♣',
        'Spades': '♠'
    };

    modal.innerHTML = `
        <div class="modal-content animate__animated animate__zoomIn">
            <h2 class="text-2xl font-bold mb-4">Select Hukum Suit</h2>
            <div class="hukum-grid">
                ${suits.map(suit => `
                    <button class="suit-button" onclick="selectHukum('${suit}')">
                        <span class="suit-icon ${suit.toLowerCase()}">${suitIcons[suit]}</span>
                        <span>${suit}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Select Hukum suit
async function selectHukum(suit) {
    const hukumSuit = suit.toLowerCase();
    
    // Update Firebase with selected Hukum
    await gameRef.update({
        hukumSuit: hukumSuit,
        status: 'playing'
    });

    // Create hukum indicator
    updateHukumIndicator(suit);
    
    // Remove modal
    const modal = document.querySelector('.modal-backdrop');
    modal.classList.remove('animate__fadeIn');
    modal.classList.add('animate__fadeOut');
    setTimeout(() => modal.remove(), 500);
}

// Update Hukum indicator
function updateHukumIndicator(suit) {
    let indicator = document.getElementById('hukum-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'hukum-indicator';
        indicator.className = 'hukum-indicator animate__animated animate__fadeInRight';
    }
    
    const suitIcon = {
        'hearts': '♥',
        'diamonds': '♦',
        'clubs': '♣',
        'spades': '♠'
    }[suit.toLowerCase()];
    
    indicator.innerHTML = `
        <span>Hukum:</span>
        <span class="suit-icon ${suit.toLowerCase()}">${suitIcon}</span>
    `;
    
    document.body.appendChild(indicator);
}

// End game
async function endGame(winningTeam) {
    // Update game status
    await gameRef.update({
        status: 'finished',
        winner: winningTeam
    });

    // Show winner announcement
    announceWinner(winningTeam);

    // Clean up listeners
    gameRef.off();

    // Offer restart option after delay
    setTimeout(showGameEndOptions, 3000);
}

// Show winner announcement
function announceWinner(team) {
    const announcement = document.createElement('div');
    announcement.className = 'winner-announcement animate__animated animate__bounceIn';
    announcement.innerHTML = `
        <div class="winner-content">
            <h2>Team ${team} Wins!</h2>
            <div class="fireworks"></div>
        </div>
    `;
    
    document.body.appendChild(announcement);
    createConfetti();
    
    setTimeout(() => {
        announcement.classList.add('animate__bounceOut');
        setTimeout(() => announcement.remove(), 1000);
    }, 3000);
}

// Create confetti effect
function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Show game end options
function showGameEndOptions() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop animate__animated animate__fadeIn';
    modal.innerHTML = `
        <div class="modal-content animate__animated animate__zoomIn">
            <h2 class="text-2xl font-bold mb-4">Game Over</h2>
            <div class="flex gap-4">
                <button onclick="restartGame()" class="bg-blue-500 text-white px-4 py-2 rounded">
                    Play Again
                </button>
                <button onclick="exitGame()" class="bg-gray-500 text-white px-4 py-2 rounded">
                    Exit
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Restart game
async function restartGame() {
    // Reset game state
    const deck = createAndShuffleDeck();
    const hands = dealCards(deck);
    
    await gameRef.update({
        status: 'playing',
        deck: deck,
        hands: hands,
        currentPlayer: 0,
        startingSuit: '',
        cardsOnTable: [],
        teamAScore: 0,
        teamBScore: 0,
        hukumSuit: ''
    });

    // Remove game end modal
    const modal = document.querySelector('.modal-backdrop');
    modal.remove();

    // Show hukum selection for first player
    if (playerPosition === 0) {
        showHukumSelection();
    }
}

// Exit game
function exitGame() {
    // Clean up Firebase listeners
    if (gameRef) {
        gameRef.off();
    }

    // Remove player from game
    if (gameId && playerId) {
        database.ref(`games/${gameId}/players/${playerId}`).remove();
    }

    // Reset variables
    gameId = null;
    playerId = null;
    playerPosition = null;
    gameRef = null;

    // Show login screen
    document.querySelector('.modal-backdrop').remove();
    gameContainer.classList.add('hidden');
    loginScreen.style.display = 'flex';
}

// Handle disconnection
window.addEventListener('beforeunload', () => {
    if (gameRef && playerId) {
        database.ref(`games/${gameId}/players/${playerId}`).remove();
    }
});

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Show login screen initially
    loginScreen.style.display = 'flex';
    gameContainer.classList.add('hidden');
});