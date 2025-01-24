const mongoose = require("mongoose");

const pixelSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  color: String,
});

const Pixel = mongoose.model("Pixel", pixelSchema);

module.exports = Pixel;
