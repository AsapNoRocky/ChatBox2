const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    socket.on("newuser", function (username) {
        io.emit("update", `${username} has joined the chatroom`);
    });

    socket.on("exituser", function (username) {
        io.emit("update", `${username} has left the chatroom`);
    });

    socket.on("chat", function (message) {
        // Send the message to all clients except the sender
        socket.broadcast.emit("chat", message);
    });

    // Handle file upload
    socket.on("file", function (fileData) {
        const { filename, dataURL } = fileData;
        const filePath = path.join(__dirname, "public", "uploads", filename);

        fs.writeFile(filePath, Buffer.from(dataURL.split(",")[1], "base64"), function (err) {
            if (err) throw err;
            io.emit("file", { sender: socket.id, filename });
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});
