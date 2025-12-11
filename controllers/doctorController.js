const Appointment = require("../models/Appointment");

// GET /api/doctor/appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ doctor: req.user._id })
      .populate("patient", "name email phone")   // 👈 ADD THIS
      .sort({ date: 1 });

    res.json({ success: true, appointments: appts });
  } catch (err) {
    console.error("APPOINTMENT FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load appointments"
    });
  }
};


// PUT /api/doctor/appointments/:id/status
exports.updateAppointmentStatusDoctor = async (req, res) => {
  try {
    const doctorId = req.user._id;   // 👈 from auth.js
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Confirmed", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const appt = await Appointment.findOne({ _id: id, doctor: doctorId });
    if (!appt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    appt.status = status;
    await appt.save();

    res.json({ success: true, message: "Status updated", appointment: appt });
  } catch (err) {
    console.error("updateAppointmentStatusDoctor error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/doctor/appointments/:id/next
exports.scheduleNextAppointment = async (req, res) => {
  try {
    const doctorId = req.user._id;   // 👈 from auth.js
    const { id } = req.params;
    const { date, timeSlot } = req.body;

    if (!date || !timeSlot) {
      return res
        .status(400)
        .json({ success: false, message: "Date and timeSlot are required" });
    }

    const current = await Appointment.findOne({ _id: id, doctor: doctorId });
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const nextAppt = await Appointment.create({
      patient: current.patient,
      doctor: current.doctor,
      date: new Date(date),
      timeSlot,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Next appointment scheduled",
      appointment: nextAppt,
    });
  } catch (err) {
    console.error("scheduleNextAppointment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
