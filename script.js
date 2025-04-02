let socket = null;
let savedServers = JSON.parse(localStorage.getItem("mudServers")) || [];
let sessionLog = JSON.parse(localStorage.getItem("mudSession")) || [];
let position = { x: 200, y: 200 }; 
let visitedRooms = [];

document.addEventListener("DOMContentLoaded", () => {
    loadServerList();
    restoreSession();
    drawMap();
});

function loadServerList() {
    let serverList = document.getElementById("serverList");
    serverList.innerHTML = "";
    savedServers.forEach((server, index) => {
        let option = document.createElement("option");
        option.value = index;
        option.textContent = `${server.address}:${server.port}`;
        serverList.appendChild(option);
    });
}

function saveServer() {
    let address = document.getElementById("serverAddress").value;
    let port = document.getElementById("serverPort").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (!address || !port) {
        alert("Address and port are required!");
        return;
    }

    savedServers.push({ address, port, username, password });
    localStorage.setItem("mudServers", JSON.stringify(savedServers));
    loadServerList();
}

function loadServer() {
    let index = document.getElementById("serverList").value;
    if (index === "") return;

    let server = savedServers[index];
    document.getElementById("serverAddress").value = server.address;
    document.getElementById("serverPort").value = server.port;
    document.getElementById("username").value = server.username;
    document.getElementById("password").value = server.password;
}

function connect() {
    let address = document.getElementById("serverAddress").value;
    let port = document.getElementById("serverPort").value;
    let wsUrl = `ws://localhost:8888?host=${address}&port=${port}`;
    socket = new WebSocket(wsUrl);

    socket.onopen = () => logMessage("Connected to server.");
    socket.onmessage = (event) => processMUDMessage(event.data);
    socket.onclose = () => logMessage("Disconnected from server.");
}

function disconnect() {
    if (socket) {
        socket.close();
        socket = null;
    }
}

function handleInput(event) {
    if (event.key === "Enter") {
        let inputField = document.getElementById("input");
        let command = inputField.value;
        inputField.value = "";
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(command);
        }
        trackMovement(command);
    }
}

function logMessage(message) {
    let output = document.getElementById("output");
    let formattedMessage = formatANSI(message);
    sessionLog.push(formattedMessage);
    localStorage.setItem("mudSession", JSON.stringify(sessionLog));

    output.innerHTML += formattedMessage + "<br>";
    output.scrollTop = output.scrollHeight;
}

function formatANSI(text) {
    return text.replace(/\x1B\[[0-9;]*m/g, ""); 
}

function restoreSession() {
    let output = document.getElementById("output");
    sessionLog.forEach(msg => {
        output.innerHTML += msg + "<br>";
    });
    output.scrollTop = output.scrollHeight;
}

function trackMovement(command) {
    const directions = { "north": [0, -20], "south": [0, 20], "east": [20, 0], "west": [-20, 0] };
    if (directions[command]) {
        position.x += directions[command][0];
        position.y += directions[command][1];
        visitedRooms.push({ ...position });
        drawMap();
    }
}

function drawMap() {
    let canvas = document.getElementById("mapperCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    visitedRooms.forEach(room => {
        ctx.fillStyle = "white";
        ctx.fillRect(room.x, room.y, 10, 10);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(position.x, position.y, 10, 10);
}
