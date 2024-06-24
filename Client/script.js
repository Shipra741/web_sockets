const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const serverUrl = `${protocol}://${window.location.host}`;
const socket = new WebSocket(serverUrl);

socket.onopen = function(event) {
    console.log("connected to web socket server");
}

socket.onmessage = function(event) {
    const chatBox = document.getElementById("chat-room");
    const newMessage = document.createElement('div');
    const data = JSON.parse(event.data);

    if (typeof data.message === 'string') {
        newMessage.textContent = data.message;
        chatBox.appendChild(newMessage);
    } else if (data.message instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function() {
            newMessage.textContent = reader.result;
            chatBox.appendChild(newMessage);
        };
        reader.readAsText(data.message);
    } else {
        newMessage.textContent = "Unsupported message format";
        chatBox.appendChild(newMessage);
    }
}

socket.onerror = function(error) {
    console.log("websocket error", error);
}

const sendMessage = (target) => {
    const messageInput = document.getElementById("chat-input");
    const message = messageInput.value.trim();
    if (message) {
        socket.send(JSON.stringify({ target, message }));
        messageInput.value = '';
    }
};

document.getElementById("send-to-self").addEventListener('click', () => sendMessage('self'));
document.getElementById("send-to-others").addEventListener('click', () => sendMessage('others'));
document.getElementById("send-to-all").addEventListener('click', () => sendMessage('all'));
