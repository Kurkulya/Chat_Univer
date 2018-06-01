const express = require('express');
const fs = require('fs');
const chatHistory = require('./chatHistory.json');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/chat', (req, res) => {
    res.sendFile( __dirname + "/public/" + "index.html" );
});


io.on('connection', function (socket) {
    let username;
    socket.on('MESSAGE_TO_SERVER', message => {
        saveChatHistory(message, username);
        io.sockets.emit('MESSAGE_TO_CLIENTS', message, username);
    });
    socket.on('SET_USERNAME', name => {
        username = name;
        socket.emit('HISTORY', getDayHistory());
        io.sockets.emit('USER_CONNECTED', username);
    });
    socket.on('disconnect', () => {
        socket.broadcast.emit('USER_DISCONNECTED', username);
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