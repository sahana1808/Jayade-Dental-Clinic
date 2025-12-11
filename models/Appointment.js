const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    // Patient who booked the appointment
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Doctor for the appointment
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Date of the appointment
    date: {
      type: Date,
      required: true,
    },

    // Time slot string (e.g., "10:00 AM")
    timeSlot: {
      type: String,
      required: true,
    },

    // Current status of the appointment
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
