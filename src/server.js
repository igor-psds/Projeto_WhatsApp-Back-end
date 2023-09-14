const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 4000;

let users = [];

const messages = {
    npp: []
}

// on -> escuntando(receptor).
// emit -> enviando algum dado.
io.on('connection', (socket) => {

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

    socket.on("join room", (roomName, cb) => {
        socket.join(roomName);
        cb(messages[roomName]);
    })

    socket.on("Send Message", ({ content, to, sender, chatName, isChannel }) => {
        if(isChannel) {
            const payload = {
                content,
                chatName,
                sender
            };
            socket.to(to).emit("new message", payload);
        } else {
            const payload = {
                content,
                chatName: sender,
                sender
            };
            socket.to(to).emit("new message", payload);
        }
        if(messages[chatName]) {
            messages[chatName].push({
                sender,
                content
            });
        }
        
    });

    socket.on("disconnect", () => {
        const disconnectedUser = users.find(user => user.id === socket.id);
        if (disconnectedUser) {
            users.splice(users.indexOf(disconnectedUser), 1);
            io.emit('users', users);
        }
    })
})

server.listen(port, () => console.log(`servidor rodando na porta ${port}`));