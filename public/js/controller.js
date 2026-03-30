const socket = io();
let myId = null;
let currentGuess = { lat: 0, lng: 0, year: 1950 };
let hasGuessed = false;

// UI Elements
const loginScreen = document.getElementById('login-screen');
const waitingRoom = document.getElementById('waiting-room');
const gameInterface = document.getElementById('game-interface');
const joinBtn = document.getElementById('join-btn');
const usernameInput = document.getElementById('username');
const yearSlider = document.getElementById('year-slider');
const yearDisplay = document.getElementById('selected-year');
const submitBtn = document.getElementById('submit-guess');
const statusMsg = document.getElementById('status-bar');

// Map Initialization
let map = null;
let currentMarker = null;

function initMap() {
    if (map) return;
    map = L.map('map-input').setView([20, 0], 1);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const redPinIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    map.on('click', (e) => {
        if (hasGuessed) return;
        if (currentMarker) map.removeLayer(currentMarker);
        currentMarker = L.marker(e.latlng, {icon: redPinIcon}).addTo(map);
        currentGuess.lat = e.latlng.lat;
        currentGuess.lng = e.latlng.lng;
    });
}

// Login Logic
joinBtn.addEventListener('click', () => {
    const name = usernameInput.value;
    if (name) {
        socket.emit('identify', { type: 'controller', name: name });
        loginScreen.classList.add('hidden');
        // Wait for server to say 'waitInLobby' or 'roundStart'
    }
});

// Slider Logic
yearSlider.addEventListener('input', (e) => {
    if (hasGuessed) return;
    yearDisplay.textContent = e.target.value;
    currentGuess.year = parseInt(e.target.value);
});

// Submit Logic
submitBtn.addEventListener('click', () => {
    if (!currentMarker) {
        alert("Placez d'abord un marqueur sur la carte !");
        return;
    }
    socket.emit('submitGuess', currentGuess);
    lockInterface();
    statusMsg.innerText = "Réponse envoyée ! En attente...";
});

function lockInterface() {
    hasGuessed = true;
    submitBtn.disabled = true;
    submitBtn.innerText = "Validé";
    yearSlider.disabled = true;
    if (map) map.dragging.disable();
}

function unlockInterface() {
    hasGuessed = false;
    submitBtn.disabled = false;
    submitBtn.innerText = "Valider";
    yearSlider.disabled = false;
    statusMsg.innerText = "À vous de jouer !";
    if (map) {
        map.dragging.enable();
        if (currentMarker) map.removeLayer(currentMarker);
        currentMarker = null;
    }
}

socket.on('joined', (playerData) => {
    myId = playerData.id;
    console.log('Joined as', playerData);
});

socket.on('waitInLobby', () => {
    if (waitingRoom) waitingRoom.classList.remove('hidden');
    gameInterface.classList.add('hidden');
});

socket.on('roundStart', () => {
    if (waitingRoom) waitingRoom.classList.add('hidden');
    gameInterface.classList.remove('hidden');
    // Initialize map now that it's visible
    setTimeout(() => {
        initMap();
        map.invalidateSize();
        if (map) map.setView([20, 0], 1); // Auto reset zoom out!
    }, 100);
    unlockInterface();
});

socket.on('gameAlreadyStarted', () => {
    statusMsg.innerText = "Partie en cours... Attendez la prochaine manche.";
    if (waitingRoom) waitingRoom.classList.add('hidden');
    gameInterface.classList.remove('hidden');
    lockInterface();
    setTimeout(() => {
        initMap();
        map.invalidateSize();
    }, 100);
});
