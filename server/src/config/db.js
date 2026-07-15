// server/src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn(
      "MONGODB_URI is not set. Starting without a database connection.",
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
