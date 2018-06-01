const express = require('express');
const fs = require('fs');
const chatHistory = require('./chatHistory.json');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 5000;

server.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
    let name = `User_${Math.floor(Math.random() * 1001)}`;
    socket.broadcast.emit('USER_CONNECTED', name);
    socket.emit('HISTORY', getDayHistory());
    socket.emit('USERNAME', name);
    socket.on('MESSAGE_TO_SERVER', message => {
        saveChatHistory(message, name);
        io.sockets.emit('MESSAGE_TO_CLIENTS', message, name);
    });
    socket.on('disconnect', () => {
        socket.broadcast.emit('USER_DISCONNECTED', name);
    });
});

function saveChatHistory(message, user) {
    const history = chatHistory;
    const time = new Date().getTime() / 1000;
    history.push({ time, message, user });
    fs.writeFile("chatHistory.json", JSON.stringify(history), error => console.log(error));
}

function getDayHistory() {
    const time = new Date().getTime() / 1000;
    return chatHistory.filter(item => (time - item.time) < 86400);
}