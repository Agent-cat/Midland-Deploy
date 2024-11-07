const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB connection URI is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (error.message.includes("index not found")) {
      console.warn("Warning: Index not found, but connection successful");
      return;
    }

    console.error("MongoDB Connection Error:", error.message);

    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "Could not connect to MongoDB server. Please check if the server is running."
      );
    } else if (error.name === "MongoParseError") {
      console.error("Invalid MongoDB connection string");
    }

    process.exit(1);
  }
};

module.exports = connectDB;
