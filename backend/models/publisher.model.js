const mongoose = require("mongoose");

const publisherSchema = new mongoose.Schema({
  tenNXB: { type: String, required: true },
  diaChi: { type: String, required: true },
});

module.exports = mongoose.model("Publisher", publisherSchema);
