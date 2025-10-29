const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const config = require("./config");
const connectDB = require("./config/db");

// Create Express app
const app = express();

// Note: connectDB is not called automatically so tests can control DB lifecycle.
// Call startServer() to connect and listen when running the server directly.

// Security Middleware
app.use(helmet(config.security.helmet));
// Configure CORS to support a list of allowed origins from config
const allowedOrigins =
  config.cors && config.cors.allowedOrigins
    ? config.cors.allowedOrigins
    : ["http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: config.cors ? config.cors.credentials : true,
  })
);
app.use(rateLimit(config.rateLimit));
app.use(mongoSanitize()); // Prevent MongoDB Operator Injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Request parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
app.use(morgan(config.logging.morgan.format));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Routes (to be added)
// API Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/accounts", require("./routes/accounts"));
app.use("/api/v1/transactions", require("./routes/transactions"));
app.use("/api/v1/transfers", require("./routes/transfers"));
app.use("/api/v1/cards", require("./routes/cards"));
app.use("/api/v1/savings", require("./routes/savings"));
app.use("/api/v1/finance", require("./routes/finance"));
app.use("/api/v1/notifications", require("./routes/notifications"));
app.use("/api/v1/payment-methods", require("./routes/paymentMethods"));

// Global Error Handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (config.nodeEnv === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production: don't leak error details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
});

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

function startServer() {
  return connectDB().then(() => {
    const PORT = config.port;
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      process.exit(1);
    });

    return server;
  });
}

// If the file is run directly, start the server
if (require.main === module) {
  startServer();
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = { app, startServer };
