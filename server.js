const PORT = 8443
const express = require('express');
const {createServer} = require('http');
const {Server} = require("socket.io");

const app = express();
const httpServer = createServer(app)
// var cors = require('cors')
// app.use(cors())

// Set up http server
const io = new Server(httpServer,{
    cors: {
        origin: "http://localhost:8080",
        credentials: true
    }
});

// Set up connection
io.on('connection',(socket) => {
    console.log("user connected");

    // Get id from multiplayerserver through client
    socket.on("multiplayerId", (data) => {

        // Set multiplayerId on socket
        socket.multiplayerId = data;

        let getSockets = async () => {

            // Get array from all sockets
            const sockets = (await io.fetchSockets()).map(socket => socket.id);

            // Get array from all multiplayer id's
            const multiplayerIds = (await io.fetchSockets()).map(socket => socket.multiplayerId);

            // Combine socket array and multiplayer id's array
            let socketsMultiplayer = sockets.map( (value, index) => {
                return [sockets[index], multiplayerIds[index]];
            })

            // If user joins send info from all sockets
            io.sockets.emit("user-joined", socket.id, io.engine.clientsCount, sockets, socketsMultiplayer);
        }
        getSockets();
    })

    // Send signal to other sockets
    socket.on('signal', (toId, message) => {
        io.to(toId).emit('signal', socket.id, message);
    });

    // When user disconnect let all sockets know
    socket.on('disconnect', () => {
        console.log("user left");
        io.sockets.emit("user-left", socket.id);

    })
});

// Listen to port on server
httpServer.listen(PORT, () => {
    console.log("Express server listening on port " + PORT + " in the browser");
});
