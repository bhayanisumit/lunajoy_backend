import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import * as socketio from "socket.io";
import patientRoutes from "./routes/patient.routes.js";
import logRoutes from "./routes/log.routes.js";
import jwt from "jsonwebtoken";
import db from "./db/db.js";
import { promisify } from "util";
const query = promisify(db.query).bind(db);
const app = express();
const httpserver = http.createServer(app);

const allowedOrigins = ['http://localhost:3000'];

// CORS Configuration
app.use(
  cors({
      origin: function (origin, callback) {
          // Allow requests with no origin (e.g., mobile apps or Postman)
          if (!origin || allowedOrigins.includes(origin)) {
              return callback(null, true);
          }
          return callback(new Error('Not allowed by CORS'));
      },
      credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/v2/patient", patientRoutes);
app.use("/api/v2/log", logRoutes);


// Initialize Socket.IO
const io = new socketio.Server(httpserver, {
  cors: {
    origin:'*', // Ensure this matches your frontend's domain
  },
});

// Socket.IO connection handling
io.on("connection", async (socket) => {
  
  const decoded = jwt.decode( socket.handshake.query.token);
  
  const [userResult] = await query("SELECT id FROM patient WHERE email = ?", [
    decoded?.email,
  ]);

 const logs = await query("SELECT * FROM logs WHERE user_id = ?", [userResult?.id]);

    socket.emit("newLog", logs)
});

const PORT = process.env.PORT;

httpserver.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});