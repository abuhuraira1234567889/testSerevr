const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const http = require("http");



dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: true,
});


var cors = require("cors");

app.use(cors());
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});


const port = process.env.PORT;
const DB = process.env.DB;

app.use(express.json({ limit: "25mb" }));

app.use(bodyParser.urlencoded({ extended: true }));
require("./src/routes/auth/auth")(app)
require("./src/routes/events/event")(app)
require("./src/routes/ticket/ticket")(app)


mongoose.connect(DB);
mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
});
mongoose.connection.on("error", (err) => {
  console.log("connection error", err);
});

io.on("connection", (socket) => {
  console.log("A user has connected");

  // Handle disconnect event if needed
  socket.on("disconnect", () => {
    console.log("A user has disconnected");
    // Handle disconnection logic here
  });
});

io.on("connection", (socket) => {
  console.log("i am connected");
 
  socket.on("join", (user) => {
    socket.join(user);
  });

  socket.on("disconnect", () => {
    console.log("Disconnect");
    
  });
});

server.listen(port, () => {
  console.log("Server is running on port " + port);
});
