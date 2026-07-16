const express = require("express");
const cors = require("cors");
const chats = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();

app.use(express.json()); // to accept json data

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3001",
    "http://localhost:3000",
    "https://orbit-chat-application-beta.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/groups', groupRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://orbit-chat-application-beta.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.set("socketio", io);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    if (userData && userData._id) {
      const userId = userData._id;
      socket.join(userId);
      socket.userId = userId;

      const currentCount = onlineUsers.get(userId) || 0;
      onlineUsers.set(userId, currentCount + 1);

      if (currentCount === 0) {
        io.emit("user-online", { userId });
      }

      socket.emit("connected");
      socket.emit("online-users-list", Array.from(onlineUsers.keys()));
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room);
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((userItem) => {
      if (userItem._id === newMessageReceived.sender._id) return;
      socket.in(userItem._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    if (socket.userId) {
      const userId = socket.userId;
      const currentCount = onlineUsers.get(userId);
      if (currentCount !== undefined) {
        const newCount = currentCount - 1;
        if (newCount <= 0) {
          onlineUsers.delete(userId);
          io.emit("user-offline", { userId });
        } else {
          onlineUsers.set(userId, newCount);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});