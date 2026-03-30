const socket = io();

// UI Elements
const screenResult = document.getElementById('screen-result');
const photoImg = document.getElementById('current-photo');
const timerDisplay = document.getElementById('timer');
const roundDisplay = document.getElementById('current-round');
const totalRoundsDisplay = document.getElementById('total-rounds');
const loadingMessage = document.getElementById('loading-message');

const leaderboardList = document.getElementById('leaderboard-list');

// Map
let map = L.map('result-map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markers = [];
let correctMarker = null;

socket.emit('identify', 'display');

// Events
socket.on('connect', () => {
    console.log("Connected to server");
    fetch('/qrcode')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('qr-code-placeholder');
            container.innerHTML = `
                <p>Scannez pour rejoindre</p>
                <img src="${data.qr}" style="width: 150px; border-radius: 8px;">
                <p style="font-size: 0.8rem; word-break: break-all;">${data.url}</p>
            `;
        });
});

socket.on('playerJoined', (player) => {
    updateLeaderboard(player);
});
socket.on('playerUpdated', (player) => {
    updateLeaderboard(player);
});

socket.on('updateState', (state) => {
    if (state.phase === 'LOBBY') {
        Object.values(state.players).forEach(updateLeaderboard);
    }
});

socket.on('roundStart', (data) => {
    // Reset view
    clearMap();
    screenResult.style.display = 'none';
    photoImg.style.display = 'block';

    // Update Info
    roundDisplay.textContent = data.round;
    totalRoundsDisplay.textContent = data.total;
    photoImg.src = data.imageUrl;
    timerDisplay.textContent = data.time;
    loadingMessage.style.display = 'none';
});

socket.on('timerUpdate', (time) => {
    timerDisplay.textContent = time;
    if (time <= 5) {
        timerDisplay.style.color = 'var(--color-blood-red)';
    } else {
        timerDisplay.style.color = ''; // Clears inline style to use CSS color
    }
});

socket.on('playerGuessed', (playerId) => {
    const li = document.getElementById(`player-${playerId}`);
    if (li) {
        li.classList.add('has-guessed');
    }
});

socket.on('roundResult', (data) => {
    photoImg.style.display = 'none';
    screenResult.style.display = 'flex';

    setTimeout(() => {
        map.invalidateSize();

        // Show Correct Location
        const correctIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        correctMarker = L.marker([data.correctLocation.lat, data.correctLocation.lng], { icon: correctIcon })
            .addTo(map)
            .bindPopup(`<b>${data.description}</b><br>Année: ${data.correctYear}`)
            .openPopup();

        // Show Player Guesses
        data.playerResults.forEach(res => {
            if (res.guess) {
                // Pin
                const pIcon = L.divIcon({
                    className: 'custom-pin',
                    html: `<div style="background-color:${res.color}; width:15px; height:15px; border-radius:50%; border:2px solid white;"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                const m = L.marker([res.guess.lat, res.guess.lng], { icon: pIcon })
                    .addTo(map)
                    .bindPopup(`<b>${res.name}</b><br>D: -${Math.floor(res.distance)}km<br>Y: ${res.guess.year} (${res.yearDiff > 0 ? '+' : ''}${0 - res.yearDiff})`);
                markers.push(m);

                // Line to correct
                const line = L.polyline([
                    [data.correctLocation.lat, data.correctLocation.lng],
                    [res.guess.lat, res.guess.lng]
                ], { color: res.color, weight: 2, opacity: 0.6, dashArray: '5, 10' }).addTo(map);
                markers.push(line);
            }
            updateLeaderboard({ id: res.id, name: res.name, score: res.totalScore, color: res.color });
        });

        const group = new L.featureGroup([correctMarker, ...markers]);
        map.fitBounds(group.getBounds().pad(0.1));

    }, 100);

    document.querySelectorAll('.has-guessed').forEach(el => el.classList.remove('has-guessed'));
});

// Admin Control
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        socket.emit('startGame');
    }
});

const startBtn = document.getElementById('start-btn');
if (startBtn) {
    startBtn.addEventListener('click', () => {
        socket.emit('startGame');
    });
}

function updateLeaderboard(player) {
    const list = document.getElementById('leaderboard-list');
    let li = document.getElementById(`player-${player.id}`);

    if (!li) {
        li = document.createElement('li');
        li.id = `player-${player.id}`;
        list.appendChild(li);
    }

    li.style.borderLeft = `5px solid ${player.color}`;
    li.innerHTML = `
        <span class="p-name">${player.name}</span>
        <span class="p-score">${player.score} pts</span>
    `;
}

function clearMap() {
    if (correctMarker) map.removeLayer(correctMarker);
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}
