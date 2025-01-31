const mongoose = require("mongoose");
const User = require("./User");

const pixelSchema = new mongoose.Schema({
  x: { type: Number, required: true }, // x 좌표
  y: { type: Number, required: true }, // y 좌표
  color: { type: String, required: true }, // 픽셀 색상
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User 참조
});

const Pixel = mongoose.model("Pixel", pixelSchema);

module.exports = Pixel;