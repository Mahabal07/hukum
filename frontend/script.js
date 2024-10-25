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
    // Create and shuffle the full deck
    deck = createDeck();
    deck.sort(() => Math.random() - 0.5);

    // Deal initial 4 cards to each player
    hands = [[], [], [], []];
    hands.forEach((hand, index) => {
        for (let i = 0; i < 4; i++) {
            const card = deck.pop();
            hand.push(card);
        }
    });

    updateGameBoard();
    showHukumSelection();
}

function distributeRemainingCards() {
    // Distribute remaining 4 cards to each player with animation
    hands.forEach((hand, playerIndex) => {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const card = deck.pop();
                hand.push(card);
                updateGameBoard();
                
                // Add animation to the newly added card
                const playerHand = document.querySelector(`#player-${playerIndex + 1}`);
                const lastCard = playerHand.querySelector('.grid-cols-4 img:last-child');
                if (lastCard) {
                    lastCard.classList.add('card-distribution-animation');
                }
            }, (playerIndex * 4 + i) * 200); // Stagger the distribution
        }
    });

    // Start the game after all cards are distributed
    setTimeout(() => {
        hukumSelected = true;
        document.getElementById('round-info').textContent = `Round ${currentRound}: Player ${currentPlayer + 1}, it's your turn!`;
        highlightCurrentPlayer();
    }, 3500); // Wait for all cards to be distributed
}

// Modify the game container style for better visibility
document.querySelector('.game-container').style.transform = 'scale(0.85)';
document.querySelector('.game-container').style.transformOrigin = 'top center';


function startGame() {
    hukumSelected = true;
    document.getElementById('hukum-selection').classList.add('hidden');
    distributeRemainingCards();
}

/* Update the JavaScript highlightCurrentPlayer function with this new version */
function highlightCurrentPlayer() {
    document.querySelectorAll('.player-hand').forEach((hand, index) => {
        if (index === currentPlayer) {
            hand.classList.remove('bg-yellow-500');  // Remove old class
            hand.classList.add('active-player');     // Add new class
            hand.classList.add('animate__animated', 'animate__pulse');
        } else {
            hand.classList.remove('active-player', 'animate__animated', 'animate__pulse');
        }
    });
  }
  

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


function selectHukum(suit) {
    hukumSuit = suit.toLowerCase();
    
    // Create or update hukum indicator
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
    
    // Remove modal with animation
    const modal = document.querySelector('.modal-backdrop');
    modal.classList.remove('animate__fadeIn');
    modal.classList.add('animate__fadeOut');
    setTimeout(() => {
        modal.remove();
        distributeRemainingCards();
    }, 500);
}

// Modify the game container style
document.querySelector('.game-container').style.transform = 'scale(0.85)';
document.querySelector('.game-container').style.transformOrigin = 'top center';

// Remove the existing hukum selection div as we're using the modal now
const oldHukumSelection = document.getElementById('hukum-selection');
if (oldHukumSelection) {
    oldHukumSelection.remove();
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

function canPlayCard(card, gameData) {
    if (gameData.cardsOnTable.length === 0) {
        return true;
    }
    
    const startingSuit = gameData.startingSuit.toLowerCase();
    const playerHand = gameData.hands[playerPosition];
    const hasStartingSuit = playerHand.some(c => c.suit.toLowerCase() === startingSuit);
    
    if (hasStartingSuit) {
        return card.suit.toLowerCase() === startingSuit;
    }
    
    return true;
}

async function playerPlaysCard(cardIndex) {
    try {
        const gameRef = ref(db, `rooms/${roomId}`);
        const snapshot = await get(gameRef);
        const gameData = snapshot.val();

        if (!gameData) {
            console.error("Game data not found");
            return;
        }

        // Create a copy of the game data to work with
        const updatedGameData = { ...gameData };
        
        // Update the necessary fields
        const playedCard = updatedGameData.hands[playerPosition][cardIndex];
        updatedGameData.hands[playerPosition] = [
            ...updatedGameData.hands[playerPosition].slice(0, cardIndex),
            ...updatedGameData.hands[playerPosition].slice(cardIndex + 1)
        ];
        updatedGameData.cardsOnTable = [...(updatedGameData.cardsOnTable || []), { player: playerPosition, card: playedCard }];

        if (updatedGameData.cardsOnTable.length === 1) {
            updatedGameData.startingSuit = playedCard.suit.toLowerCase();
        }

        updatedGameData.currentPlayer = (updatedGameData.currentPlayer + 1) % 4;

        // Use the safe update function
        const updateSuccess = await updateGameDataInFirebase(updatedGameData);
        if (!updateSuccess) {
            console.error("Failed to update game data");
        }
    } catch (error) {
        console.error("Error in playerPlaysCard:", error);
    }
}

function moveCardToTable(card) {
    const middleTable = document.getElementById('middle-table');
    const cardImg = document.createElement('img');
    cardImg.src = card.image;
    cardImg.alt = `${card.value} of ${card.suit}`;
    cardImg.className = 'w-32 h-48 transition-transform transform card-played';
    
    // Add floating animation
    cardImg.style.animation = `
        playCard 0.5s ease-out,
        float 3s ease-in-out infinite
    `;
    
    middleTable.appendChild(cardImg);
}

function declareRoundWinner() {
    const winningIndex = determineRoundWinner();
    const winningTeam = winningIndex % 2 === 0 ? 'A' : 'B';
    
    if (winningTeam === 'A') {
        teamAScore++;
        document.getElementById('team-a-score').classList.add('animate__animated', 'animate__pulse');
    } else {
        teamBScore++;
        document.getElementById('team-b-score').classList.add('animate__animated', 'animate__pulse');
    }

    const roundInfo = document.getElementById('round-info');
    roundInfo.textContent = `Player ${winningIndex + 1} (Team ${winningTeam}) wins this round!`;
    roundInfo.classList.add('animate__animated', 'animate__bounceIn');
    
    // Remove animation classes after they complete
    setTimeout(() => {
        document.querySelectorAll('.animate__animated').forEach(el => {
            el.classList.remove('animate__animated', 'animate__pulse', 'animate__bounceIn');
        });
    }, 1000);

    updateScores();
    checkForGameWinner();
    return winningIndex;
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
function announceWinner(team) {
    const gameContainer = document.querySelector('.game-container');
    const announcement = document.createElement('div');
    announcement.className = 'winner-announcement animate__animated animate__bounceIn';
    announcement.innerHTML = `
        <div class="winner-content">
            <h2>Team ${team} Wins!</h2>
            <div class="fireworks"></div>
        </div>
    `;
    
    gameContainer.appendChild(announcement);
    
    // Add confetti effect
    createConfetti();
    
    setTimeout(() => {
        announcement.classList.add('animate__bounceOut');
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }, 3000);
}

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


// Game Initialization
shuffleAndDeal();