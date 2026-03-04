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

// Initialize DB connection for serverless (Vercel) - MUST BE BEFORE ROUTES
let dbConnectionPromise = null;

if (process.env.VERCEL) {
  // Start connection immediately on cold start
  dbConnectionPromise = connectDB().catch((err) => {
    console.error("Failed to initialize MongoDB connection:", err);
    return null;
  });
  
  // Middleware to ensure connection is ready before handling requests
  app.use(async (req, res, next) => {
    try {
      if (dbConnectionPromise) {
        await dbConnectionPromise;
      }
      next();
    } catch (err) {
      console.error("Database connection error:", err);
      res.status(503).json({ 
        status: "error",
        message: "Database temporarily unavailable" 
      });
    }
  });
}

// Security Middleware
app.use(helmet(config.security.helmet));
// Configure CORS to allow all origins
app.use(cors({ origin: "*" }));

// Add explicit CORS headers for all routes (Vercel serverless fallback)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

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

// Static file serving for uploads (only in local environments)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
if (!isServerless) {
  app.use('/uploads', express.static('src/uploads'));
}

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

async function startServer() {
  await connectDB();

  const PORT = config.port;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });

  // Gracefully handle shutdowns when running long-lived processes
  const shutdown = (err) => {
    if (err) {
      console.error("Server shutting down due to error:", err);
    }
    server.close(() => process.exit(err ? 1 : 0));
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}

// If the file is run directly (e.g. `node src/server.js`), start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
