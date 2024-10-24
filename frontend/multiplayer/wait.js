import { db, auth } from './firebase-config.js';
import { getDatabase, ref, onValue, set, remove, get, push } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

let currentUser = null;
let currentRoom = null;
let playerPosition = null;
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('roomId');

// Initialize auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        initializeWaitingRoom();
    } else {
        window.location.href = 'index.html';
    }
});

async function initializeWaitingRoom() {
    if (!roomId) {
        window.location.href = 'index.html';
        return;
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    
    onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            currentRoom = snapshot.val();
            
            // Find player's position in the room
            const players = currentRoom.players || {};
            playerPosition = Object.keys(players).find(pos => players[pos].id === currentUser.uid);
            
            if (!playerPosition && Object.keys(players).length >= 4) {
                // Room is full, redirect to index
                window.location.href = 'index.html';
                return;
            }

            document.getElementById('roomName').textContent = currentRoom.name || 'Game Room';
            updatePlayersGrid();
            updateReadyButton();
            checkGameStart();
        } else {
            window.location.href = 'index.html';
        }
    });
}

function updatePlayersGrid() {
    const playersGrid = document.getElementById('playersGrid');
    playersGrid.innerHTML = '';
    
    // Create 4 slots for players
    for (let i = 0; i < 4; i++) {
        const player = currentRoom.players?.[i];
        const slot = createPlayerSlot(i, player);
        playersGrid.appendChild(slot);
    }
}

function createPlayerSlot(position, player) {
    const div = document.createElement('div');
    div.className = `bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-md
                    ${player ? 'border-2 border-green-500' : 'border-2 border-gray-500 border-dashed'}
                    animate__animated animate__fadeIn`;
    
    if (player) {
        const isCurrentPlayer = player.id === currentUser.uid;
        div.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-bold">Player ${position + 1} ${isCurrentPlayer ? '(You)' : ''}</h3>
                    <p class="text-sm text-gray-300">${player.name || player.id.slice(0, 6)}</p>
                </div>
                ${player.ready ? 
                    '<span class="text-green-500">Ready ✓</span>' : 
                    '<span class="text-yellow-500">Not Ready</span>'}
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="flex items-center justify-center h-24">
                <p class="text-gray-400">Waiting for Player ${position + 1}...</p>
            </div>
        `;
    }
    
    return div;
}

function updateReadyButton() {
    const readyBtn = document.getElementById('readyBtn');
    if (!currentRoom?.players || !playerPosition) {
        readyBtn.disabled = true;
        return;
    }

    const currentPlayer = currentRoom.players[playerPosition];
    if (!currentPlayer) {
        readyBtn.disabled = true;
        return;
    }

    readyBtn.disabled = false;
    const isReady = currentPlayer.ready || false;
    readyBtn.textContent = isReady ? 'Not Ready' : 'Ready';
    readyBtn.className = `px-4 py-2 rounded-lg font-bold transition-colors ${
        isReady ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
    }`;
}

// Handle Ready Button
document.getElementById('readyBtn').addEventListener('click', async () => {
    if (!currentRoom?.players || !playerPosition) return;

    const currentPlayer = currentRoom.players[playerPosition];
    if (!currentPlayer) return;

    const playerRef = ref(db, `rooms/${roomId}/players/${playerPosition}`);
    const newReadyState = !currentPlayer.ready;
    
    try {
        await set(playerRef, {
            ...currentPlayer,
            ready: newReadyState
        });
    } catch (error) {
        console.error('Error updating ready state:', error);
    }
});

// Handle Leave Button
document.getElementById('leaveBtn').addEventListener('click', async () => {
    if (!currentRoom?.players || !playerPosition) return;

    try {
        // Remove player from the room
        const playerRef = ref(db, `rooms/${roomId}/players/${playerPosition}`);
        await remove(playerRef);
        
        // Check if room is empty
        const roomRef = ref(db, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        const room = snapshot.val();
        
        if (!room?.players || Object.keys(room.players).length === 0) {
            await remove(roomRef);
        }
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error leaving room:', error);
    }
});

function checkGameStart() {
    if (!currentRoom?.players) return;

    const players = currentRoom.players;
    const playerCount = Object.keys(players).length;
    const allReady = playerCount === 4 && Object.values(players).every(player => player.ready);
    
    if (allReady && !currentRoom.gameStarted) {
        startGameCountdown();
    }
}

async function startGameCountdown() {
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownElement = document.getElementById('countdown');
    let count = 3;
    
    countdownDisplay.classList.remove('hidden');
    countdownDisplay.classList.add('flex');
    
    const interval = setInterval(async () => {
        count--;
        countdownElement.textContent = count;
        
        if (count === 0) {
            clearInterval(interval);
            try {
                // Set game as started in database
                const roomRef = ref(db, `rooms/${roomId}`);
                await set(roomRef, {
                    ...currentRoom,
                    gameStarted: true
                });
                
                // Redirect to game page
                window.location.href = `game.html?roomId=${roomId}`;
            } catch (error) {
                console.error('Error starting game:', error);
                countdownDisplay.classList.add('hidden');
            }
        }
    }, 1000);
}

// Clean up when window is closed
window.addEventListener('beforeunload', async () => {
    if (currentUser && roomId && playerPosition) {
        try {
            const playerRef = ref(db, `rooms/${roomId}/players/${playerPosition}`);
            await remove(playerRef);
            
            // Check if room is empty and remove if necessary
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);
            const room = snapshot.val();
            
            if (!room?.players || Object.keys(room.players).length === 0) {
                await remove(roomRef);
            }
        } catch (error) {
            console.error('Error cleaning up:', error);
        }
    }
});