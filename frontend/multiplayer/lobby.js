// lobby.js
import { db, auth } from './firebase-config.js';
import { getDatabase, ref, onValue, set, remove, get, push } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

let currentUser = null;

// Authenticate anonymously when the page loads
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
  })
  .catch((error) => {
    console.error("Error signing in anonymously:", error);
  });

// Initialize auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('userDisplay').textContent = `Player: ${user.uid.slice(0, 6)}`;
        loadRooms();
    } else {
        console.log("No user signed in, attempting to sign in anonymously");
        signInAnonymously(auth);
    }
});

// Load and display rooms
function loadRooms() {
    const roomsRef = ref(db, 'rooms');
    onValue(roomsRef, (snapshot) => {
        const roomsGrid = document.getElementById('roomsGrid');
        roomsGrid.innerHTML = '';
        
        if (snapshot.exists()) {
            const rooms = snapshot.val();
            Object.entries(rooms).forEach(([roomId, room]) => {
                const playerCount = room.players ? Object.keys(room.players).length : 0;
                const isJoinable = playerCount < 4 && !room.gameStarted;
                
                const roomElement = createRoomElement(roomId, room.name, playerCount, isJoinable);
                roomsGrid.appendChild(roomElement);
            });
        }
    });
}

function createRoomElement(roomId, roomName, playerCount, isJoinable) {
    const div = document.createElement('div');
    div.className = `bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-md 
                    shadow-xl transform transition-all duration-300 hover:scale-105
                    ${isJoinable ? 'cursor-pointer hover:bg-opacity-20' : 'opacity-60'}`;
    
    div.innerHTML = `
        <h3 class="text-xl font-bold mb-2">${roomName}</h3>
        <div class="flex justify-between items-center">
            <span class="text-sm">Players: ${playerCount}/4</span>
            <span class="px-3 py-1 rounded-full text-sm ${
                isJoinable ? 'bg-green-500' : 'bg-red-500'
            }">${isJoinable ? 'Open' : 'Full'}</span>
        </div>
    `;

    if (isJoinable) {
        div.addEventListener('click', () => joinRoom(roomId));
    }

    return div;
}

// Create room functionality
document.getElementById('createRoomBtn').addEventListener('click', () => {
    document.getElementById('createRoomModal').classList.remove('hidden');
    document.getElementById('createRoomModal').classList.add('flex');
});

document.getElementById('confirmCreateRoom').addEventListener('click', () => {
    const roomName = document.getElementById('roomNameInput').value.trim();
    if (roomName) {
        createRoom(roomName);
        document.getElementById('createRoomModal').classList.add('hidden');
        document.getElementById('roomNameInput').value = '';
    }
});

document.getElementById('cancelCreateRoom').addEventListener('click', () => {
    document.getElementById('createRoomModal').classList.add('hidden');
    document.getElementById('roomNameInput').value = '';
});

// lobby.js

// ... (previous code remains the same)

async function createRoom(roomName) {
    if (!currentUser) {
        console.error("No authenticated user");
        return;
    }

    const roomsRef = ref(db, 'rooms');
    const newRoomRef = push(roomsRef);

    const initialGameState = {
        name: roomName,
        creator: currentUser.uid,
        gameStarted: false,
        players: {
            0: {
                id: currentUser.uid,
                name: currentUser.displayName || 'Player 1',
                position: 0,
                ready: false,
                team: 'A'  // Players 0 and 2 are team A
            }
        },
        currentPlayer: 0,
        hukumSelected: false,
        hands: {
            0: [],
            1: [],
            2: [],
            3: []
        },
        teamAScore: 0,
        teamBScore: 0,
        cardsOnTable: [],
        currentRound: 1
    };

    try {
        await set(newRoomRef, initialGameState);
        window.location.href = `wait.html?roomId=${newRoomRef.key}`;
    } catch (error) {
        console.error("Error creating room:", error);
    }
}

// Join room function with proper player positioning
async function joinRoom(roomId) {
    if (!currentUser) {
        console.error("No authenticated user");
        return;
    }

    const roomRef = ref(db, `rooms/${roomId}`);

    try {
        const snapshot = await get(roomRef);
        const room = snapshot.val();

        if (!room) {
            console.error("Room not found");
            return;
        }

        if (room.gameStarted) {
            console.error("Game already started");
            return;
        }

        const players = room.players || {};
        const playerCount = Object.keys(players).length;

        if (playerCount >= 4) {
            console.error("Room is full");
            return;
        }

        const position = playerCount;
        const team = position % 2 === 0 ? 'A' : 'B';

        // Update players object with new player
        const updatedPlayers = {
            ...players,
            [position]: {
                id: currentUser.uid,
                name: currentUser.displayName || `Player ${position + 1}`,
                position: position,
                ready: false,
                team: team
            }
        };

        // Update room with new player information
        await set(ref(db, `rooms/${roomId}/players`), updatedPlayers);

        window.location.href = `wait.html?roomId=${roomId}`;
    } catch (error) {
        console.error("Error joining room:", error);
    }
}


// ... (rest of the code remains the same)



// Sign out functionality
document.getElementById('signOutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("Signed out successfully");
        // After signing out, sign in anonymously again
        signInAnonymously(auth);
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
});
