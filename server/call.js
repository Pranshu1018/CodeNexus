import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);

let onlineUsers = [];
let firstUser = null; // Stores the first connected user
let offers = [];

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  onlineUsers.push({ id: socket.id });

  socket.emit("connection", { socketId: socket.id });
  io.emit("onlineUsers", onlineUsers);

  // If an offer exists, send it to the new user
  if (offers.length > 0) {
    socket.emit("offer", offers[0]);
  }

  if (!firstUser) {
    firstUser = socket.id;
  } else {
    io.to(firstUser).emit("ready"); // Notify first user
    io.to(socket.id).emit("ready"); // Notify second user
  }

  socket.on("offer", (offer) => {
    offers = [offer]; // Store only the latest offer
    socket.broadcast.emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.broadcast.emit("ice-candidate", candidate);
  });

  socket.on("hangup", () => {
    console.log("Call ended by:", socket.id);
    socket.broadcast.emit("hangup"); // Notify other peer
    offers = []; // Clear offers after hangup
  });

  socket.on("send-message", (message) => {
    console.log(`Message received: ${message}`);
    io.emit("send-message", message); // Broadcast to all users
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    onlineUsers = onlineUsers.filter((user) => user.id !== socket.id);
    io.emit("onlineUsers", onlineUsers);

    if (socket.id === firstUser) {
      firstUser = onlineUsers.length > 0 ? onlineUsers[0].id : null;
    }

    socket.broadcast.emit("hangup"); // End call if user disconnects
  });
});

server.listen(5100, () => {
  console.log("Server running on port 5100");
});
