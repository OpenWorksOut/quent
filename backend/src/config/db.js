const mongoose = require("mongoose");
const config = require("./index");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      ...config.mongodb.options,
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(config.mongodb.uri, options)
      .then((mongooseInstance) => {
        console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);

        mongoose.connection.on("error", (err) => {
          console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
          console.warn("MongoDB disconnected. Attempting to reconnect...");
        });

        mongoose.connection.on("reconnected", () => {
          console.log("MongoDB reconnected");
        });

        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
