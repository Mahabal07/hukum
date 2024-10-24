import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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
const db = getDatabase(app);
const auth = getAuth(app);

// Game state variables
let currentUser = null;
let roomId = null;
let playerPosition = null;
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

// Create and inject the popup HTML
function createPopup() {
    // Check if popup already exists
    if (document.getElementById('errorPopup')) return;
    
    const popupHTML = `
        <div id="errorPopup" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4" id="popupTitle">Error</h3>
                <p class="text-gray-600 mb-6" id="popupMessage"></p>
                <div class="flex justify-end space-x-4">
                    <button id="popupCancel" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                        Cancel
                    </button>
                    <button id="popupConfirm" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                        Continue
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// Show popup function
function showErrorPopup(title, message) {
    return new Promise((resolve) => {
        // Ensure popup exists before trying to use it
        if (!document.getElementById('errorPopup')) {
            createPopup();
        }
        
        const popup = document.getElementById('errorPopup');
        const titleElement = document.getElementById('popupTitle');
        const messageElement = document.getElementById('popupMessage');
        const confirmButton = document.getElementById('popupConfirm');
        const cancelButton = document.getElementById('popupCancel');

        titleElement.textContent = title;
        messageElement.textContent = message;
        popup.classList.remove('hidden');

        const handleConfirm = () => {
            popup.classList.add('hidden');
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            popup.classList.add('hidden');
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            confirmButton.removeEventListener('click', handleConfirm);
            cancelButton.removeEventListener('click', handleCancel);
        };

        confirmButton.addEventListener('click', handleConfirm);
        cancelButton.addEventListener('click', handleCancel);
    });
}

// Initialize auth and game state
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed. User:", user);
    if (user) {
        currentUser = user;
        console.log("Initializing game for user:", user.uid);
        initializeGame();
    } else {
        console.log("No authenticated user, waiting briefly before showing error...");
        setTimeout(async () => {
            if (!auth.currentUser) {
                createPopup();
                const shouldRedirect = await showErrorPopup(
                    "Authentication Error",
                    "You are not authenticated. Would you like to return to the login page?"
                );
                if (shouldRedirect) {
                    window.location.href = 'index.html';
                }
            } else {
                console.log("User authenticated after delay, initializing game");
                currentUser = auth.currentUser;
                initializeGame();
            }
        }, 6000);
    }
});

// game.js

// ... (previous code remains the same)

async function initializeGame() {
    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('roomId');

    if (!roomId) {
        console.error("No room ID provided");
        window.location.href = 'index.html';
        return;
    }

    const gameRef = ref(db, `rooms/${roomId}`);
    
    // First, get the initial data
    const initialSnapshot = await get(gameRef);
    if (!initialSnapshot.exists()) {
        console.error("Game room not found");
        window.location.href = 'index.html';
        return;
    }

    // Set up the listener for real-time updates
    onValue(gameRef, (snapshot) => {
        const gameData = snapshot.val();
        if (!gameData) {
            console.error("Game data is null or undefined");
            return; // Don't redirect, just return to prevent data loss
        }

        // Find current player's position without modifying the data
        if (!playerPosition || playerPosition === -1) {
            const players = gameData.players;
            const newPosition = Object.keys(players).find(pos => players[pos].id === currentUser.uid);
            if (newPosition !== undefined) {
                playerPosition = parseInt(newPosition);
            } else {
                console.error("Player not found in game");
                return; // Don't redirect, just return
            }
        }

        // Update the game state without writing back to Firebase
        updateGameState(gameData);
    });
}

// Updated updateGameState function
async function updateGameState(gameData) {
    if (!gameData) {
        console.error('Game data is undefined');
        return;
    }

    // Update local game variables without modifying the original gameData
    hands = gameData.hands || [[], [], [], []];
    currentRound = gameData.currentRound || 1;
    currentPlayer = gameData.currentPlayer || 0;
    hukumSuit = gameData.hukumSuit || '';
    deck = gameData.deck || [];
    cardsOnTable = gameData.cardsOnTable || [];
    teamAScore = gameData.teamAScore || 0;
    teamBScore = gameData.teamBScore || 0;
    startingSuit = gameData.startingSuit || '';
    hukumSelected = gameData.hukumSelected || false;

    // Update UI without modifying the game data
    if (gameData.players) {
        updateGameBoard(gameData.players);
        updateScores();
        updateRoundInfo();
        updatePlayerTurnIndicator(gameData.players);
    }

    // Handle Hukum selection if needed
    if (currentPlayer === 0 && !hukumSelected) {
        showHukumSelection();
    }
}


// function updateGameState(gameData) {
//     if (!gameData) {
//         console.error('Game data is undefined');
//         return;
//     }

//     hands = gameData.hands || [[], [], [], []];
//     currentRound = gameData.currentRound || 1;
//     currentPlayer = gameData.currentPlayer || 0;
//     hukumSuit = gameData.hukumSuit || '';
//     deck = gameData.deck || [];
//     cardsOnTable = gameData.cardsOnTable || [];
//     teamAScore = gameData.teamAScore || 0;
//     teamBScore = gameData.teamBScore || 0;
//     startingSuit = gameData.startingSuit || '';
//     hukumSelected = gameData.hukumSelected || false;

//     if (gameData.players) {
//         const players = Object.values(gameData.players);
//         playerPosition = players.findIndex(p => p.id === currentUser.uid);
//         if (playerPosition === -1) {
//             console.error('Current player not found in game data');
//         }
//     } else {
//         console.error('Players data is missing');
//         playerPosition = -1;
//     }

//     updateGameBoard();
//     updateScores();
//     updateRoundInfo();

//     if (currentPlayer === 0 && !hukumSelected) {
//         showHukumSelection();
//     }
// }

function getRelativePositions(playerPos) {
    const positions = [];
    for (let i = 0; i < 4; i++) {
        positions.push((playerPos + i) % 4);
    }
    return positions;
}

function updateGameBoard(players) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    // Create player positions relative to current player
    const positions = getRelativePositions(playerPosition);

    positions.forEach((pos, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.id = `player-${pos}`;
        playerDiv.className = `player-hand p-4 bg-white rounded shadow-lg flex flex-col items-center 
            ${pos === currentPlayer ? 'active-player' : ''}
            ${players[pos].team === 'A' ? 'team-a' : 'team-b'}`;

        const playerTitle = document.createElement('h3');
        playerTitle.className = 'text-center font-bold mb-4';
        playerTitle.textContent = `${players[pos].name}${pos === playerPosition ? ' (You)' : ''}`;

        const handDiv = document.createElement('div');
        handDiv.className = 'grid grid-cols-4 gap-2';

        if (pos === playerPosition) {
            // Show actual cards for current player
            hands[pos].forEach((card, cardIndex) => {
                const cardImg = createCardElement(card, cardIndex);
                handDiv.appendChild(cardImg);
            });
        } else {
            // Show card backs for other players
            hands[pos].forEach(() => {
                const cardBack = document.createElement('img');
                cardBack.src = 'cards/back.webp';
                cardBack.className = 'w-24 h-32';
                handDiv.appendChild(cardBack);
            });
        }

        playerDiv.appendChild(playerTitle);
        playerDiv.appendChild(handDiv);
        gameBoard.appendChild(playerDiv);
    });

    updateMiddleTable();
}





function createCardElement(card, index) {
    const cardImg = document.createElement('img');
    cardImg.src = card.image;
    cardImg.alt = `${card.value} of ${card.suit}`;
    cardImg.className = 'w-24 h-32 transition-transform transform hover:scale-105';

    if (playerPosition === currentPlayer && canPlayCard(card)) {
        cardImg.classList.add('cursor-pointer', 'hover:shadow-lg');
        cardImg.addEventListener('click', () => playerPlaysCard(index));
    }

    return cardImg;
}

function updateMiddleTable() {
    const middleTable = document.getElementById('middle-table');
    middleTable.innerHTML = '';

    cardsOnTable.forEach(({card}) => {
        const cardImg = document.createElement('img');
        cardImg.src = card.image;
        cardImg.alt = `${card.value} of ${card.suit}`;
        cardImg.className = 'w-32 h-48 transition-transform transform card-played';
        middleTable.appendChild(cardImg);
    });
}

function updateScores() {
    document.getElementById('team-a-score').textContent = `Team A: ${teamAScore}`;
    document.getElementById('team-b-score').textContent = `Team B: ${teamBScore}`;
}

function updateRoundInfo() {
    const roundInfo = document.getElementById('round-info');
    if (hukumSelected) {
        roundInfo.textContent = `Round ${currentRound}: Player ${currentPlayer + 1}'s turn`;
    } else {
        roundInfo.textContent = `Waiting for Player ${currentPlayer + 1} to select Hukum`;
    }
}
function showHukumSelection() {
    console.log("Showing Hukum selection");
    const hukumSelection = document.getElementById('hukum-selection');
    if (!hukumSelection) {
        console.error("Hukum selection element not found");
        return;
    }
    hukumSelection.classList.remove('hidden');

    const hukumButtons = hukumSelection.querySelector('.hukum-buttons');
    hukumButtons.innerHTML = suits.map(suit => `
        <button onclick="selectHukum('${suit}')" class="hukum-button">
            ${suit}
        </button>
    `).join('');

    // Only enable buttons for the first player
    if (playerPosition !== 0) {
        hukumButtons.querySelectorAll('button').forEach(btn => btn.disabled = true);
    }
}


window.selectHukum = async function(suit) {
    hukumSuit = suit.toLowerCase();
    hukumSelected = true;

    const gameRef = ref(db, `rooms/${roomId}`);
    const gameSnapshot = await get(gameRef);
    const gameData = gameSnapshot.val();

    gameData.hukumSuit = hukumSuit;
    gameData.hukumSelected = true;

    await set(gameRef, gameData);

    document.getElementById('hukum-selection').classList.add('hidden');
}

function canPlayCard(card) {
    if (cardsOnTable.length === 0) {
        return true;
    }
    
    const playerHasStartingSuit = hands[playerPosition].some(c => 
        c.suit.toLowerCase() === startingSuit.toLowerCase()
    );
    
    if (playerHasStartingSuit) {
        return card.suit.toLowerCase() === startingSuit.toLowerCase();
    }
    return true;
}

async function updateGameDataInFirebase(updates) {
    try {
        const gameRef = ref(db, `rooms/${roomId}`);
        const snapshot = await get(gameRef);
        const currentData = snapshot.val();
        
        if (!currentData) {
            console.error("Cannot update: Game data not found");
            return false;
        }

        // Merge current data with updates
        const updatedData = { ...currentData, ...updates };
        await set(gameRef, updatedData);
        return true;
    } catch (error) {
        console.error("Error updating game data:", error);
        return false;
    }
}

async function playerPlaysCard(cardIndex) {
    const gameRef = ref(db, `rooms/${roomId}`);
    const gameSnapshot = await get(gameRef);
    const gameData = gameSnapshot.val();

    const playedCard = gameData.hands[playerPosition][cardIndex];
    gameData.hands[playerPosition].splice(cardIndex, 1);
    gameData.cardsOnTable.push({ player: playerPosition, card: playedCard });

    if (gameData.cardsOnTable.length === 1) {
        gameData.startingSuit = playedCard.suit.toLowerCase();
    }

    gameData.currentPlayer = (gameData.currentPlayer + 1) % 4;

    if (gameData.cardsOnTable.length === 4) {
        const winningPlayer = determineRoundWinner(gameData);
        gameData.currentPlayer = winningPlayer;
        gameData.cardsOnTable = [];
        gameData.startingSuit = '';
        gameData.currentRound++;

        if (winningPlayer % 2 === 0) {
            gameData.teamAScore++;
        } else {
            gameData.teamBScore++;
        }

        if (gameData.teamAScore === 5 || gameData.teamBScore === 5) {
            gameData.gameOver = true;
        }
    }

    await set(gameRef, gameData);
}

function determineRoundWinner(gameData) {
    const cardPriority = {'7': 0, '8': 1, '9': 2, '10': 3, 'Jack': 4, 'Queen': 5, 'King': 6, 'Ace': 7};

    function calculatePriority(card) {
        if (card.suit.toLowerCase() === gameData.hukumSuit) {
            return 16 + cardPriority[card.value];
        } else if (card.suit.toLowerCase() === gameData.startingSuit.toLowerCase()) {
            return 8 + cardPriority[card.value];
        } else {
            return cardPriority[card.value];
        }
    }

    gameData.cardsOnTable.sort((a, b) => calculatePriority(b.card) - calculatePriority(a.card));
    return gameData.cardsOnTable[0].player;
}

// Create popup immediately when script loads
createPopup();

// Game Initialization
initializeGame();