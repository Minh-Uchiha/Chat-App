const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/messages");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require("./utils/users");

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Enable neccessary middlewares
app.use(express.static(path.join(__dirname, "../public")));

let cnt = 0;
const filter = new Filter();

io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) return callback(error);
    socket.join(user.room);
    socket.emit(
      "message",
      generateMessage("Admin", "Welcome to the chat application!")
    );
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessages", (message, callback) => {
    if (filter.isProfane(message))
      return callback("Message includes profanity");
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocation(
        user.username,
        `https://google.com/maps?q=${coords.x},${coords.y}`
      )
    );
    callback("Location Shared!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log(user.username);
      io.emit(
        "message",
        generateMessage("Admin", `User ${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log("Server is listening to port", PORT));
