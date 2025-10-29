require("dotenv").config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/quant-fin-suite",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key-in-production",
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  // CORS configuration
  // Allow configuring one or more origins via CORS_ORIGIN (comma-separated)
  cors: {
    // we'll parse allowed origins and the server will use the array to validate incoming origins
    allowedOrigins: (
      process.env.CORS_ORIGIN ||
      "http://localhost:3000,http://localhost:8080,http://localhost:5173"
    )
      .split(",")
      .map((s) => s.trim()),
    credentials: true,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Security
  security: {
    bcryptSaltRounds: 12,
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
        },
      },
    },
  },

  // File upload
  upload: {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  },

  // Email configuration (if needed)
  email: {
    from: process.env.EMAIL_FROM || "noreply@quantfinsuite.com",
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    morgan: {
      format: process.env.NODE_ENV === "production" ? "combined" : "dev",
    },
  },
};

module.exports = config;
