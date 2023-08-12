const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 4000;

const users = [];

// on -> escuntando(receptor).
// emit -> enviando algum dado.
io.on('connection', (socket) => {
    socket.on("disconnect", () => {
        const disconnectedUser = users.find(user => user.id === socket.id);
        if (disconnectedUser) {
            users.splice(users.indexOf(disconnectedUser), 1);
            io.emit('users', users);
        }
    })

    socket.on("join", (name) => {
        const user = {id: socket.id, name};
        users.push(user);
        //io.emit("message", {name: null, message: `${name} entrou no chat`});
        console.log(user.id, user.name);
        io.emit("users", users);
    })

    socket.on("message", (message) => {
        io.emit("message", message);
    })

    //Private messages
    socket.on("privateMessage", ({senderName, recipientId, message}) => {
        const sender = users.find(user => user.name === senderName);
        const recipient = users.find(user => user.id === recipientId);
        if (sender && recipient) {
            //Creates room for private messages
            const roomName = `${sender.id}-${recipient.id}`;
            console.log('Creating room:', roomName);
            socket.join(roomName);
            io.to(roomName).emit("privateMessage", { sender, recipient, message});
        }
    })
})

server.listen(port, () => console.log(`servidor rodando na porta ${port}`));