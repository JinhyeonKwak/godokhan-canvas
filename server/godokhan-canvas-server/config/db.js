const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}`;
    await mongoose.connect(mongoURI);
    console.log("[MongoDB] Connected successfully.");
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
