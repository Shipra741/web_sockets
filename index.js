const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const WebSocket = require("ws");

app.use(express.static(path.join(__dirname, 'Client')));
const connectedClients = [];

const wss = new WebSocket.Server({ server: http });

wss.on('connection', (ws) => {
    console.log("new client connected");
    connectedClients.push(ws);

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        console.log("received " + parsedMessage.message);
        if (parsedMessage.target === 'self') {
            ws.send(JSON.stringify({ from: 'server', message: parsedMessage.message }));
        } else if (parsedMessage.target === 'others') {
            connectedClients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ from: 'server', message: parsedMessage.message }));
                }
            });
        } else if (parsedMessage.target === 'all') {
            connectedClients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ from: 'server', message: parsedMessage.message }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log("client disconnected");
        const index = connectedClients.indexOf(ws);
        if (index !== -1) {
            connectedClients.splice(index, 1);
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

http.listen(1300, () => {
    console.log('server is running on port 1300');
});
