const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const twoFactorRoutes = require("./routes/twoFactorRoutes");

dotenv.config();
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000", 
    "https://task-project-two-rust.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/2fa", twoFactorRoutes);

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Task Management API is running",
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Task Management API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      tasks: "/api/tasks",
      twoFactor: "/api/2fa"
    }
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Server Running
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
