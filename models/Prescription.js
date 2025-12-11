const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  details: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Prescription", PrescriptionSchema);
