let socket = null;

function connectToServer() {
    const address = document.getElementById("serverAddress").value;
    if (!address.startsWith("ws://") && !address.startsWith("wss://")) {
        alert("Invalid WebSocket URL! It should start with ws:// or wss://");
        return;
    }

    socket = new WebSocket(address);
    
    socket.onopen = () => {
        logMessage("Connected to " + address);
        document.getElementById("userInput").disabled = false;
        document.querySelector("button[onclick='disconnectFromServer()']").disabled = false;
    };

    socket.onmessage = (event) => {
        logMessage(event.data);
    };

    socket.onerror = (error) => {
        logMessage("Error: " + error.message);
    };

    socket.onclose = () => {
        logMessage("Disconnected from server.");
        document.getElementById("userInput").disabled = true;
        document.querySelector("button[onclick='disconnectFromServer()']").disabled = true;
    };
}

function disconnectFromServer() {
    if (socket) {
        socket.close();
    }
}

function sendMessage(event) {
    if (event.key === "Enter" && socket && socket.readyState === WebSocket.OPEN) {
        const input = document.getElementById("userInput");
        socket.send(input.value);
        logMessage("> " + input.value);
        input.value = "";
    }
}

function logMessage(message) {
    const output = document.getElementById("mudOutput");
    output.innerHTML += message + "\n";
    output.scrollTop = output.scrollHeight;
}
