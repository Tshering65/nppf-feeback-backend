const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // URL of the uploaded profile picture
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
