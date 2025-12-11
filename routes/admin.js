const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/auth");

// ============================================================
//  ADD DOCTOR (Admin Only)
// ============================================================
router.post("/add-doctor", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, phone, password, speciality } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({ email, role: "doctor" });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = new User({
      name,
      email,
      phone,
      speciality: speciality || "",
      password: hashedPassword,
      role: "doctor",
    });

    await doctor.save();

    return res.json({
      success: true,
      message: "Doctor added successfully!",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        speciality: doctor.speciality,
        role: doctor.role,
      },
    });
  } catch (err) {
    console.error("ADD DOCTOR ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error while adding doctor" });
  }
});

// ============================================================
//  GET ALL DOCTORS (Admin Only)
// ============================================================
router.get("/doctors", auth(["admin"]), async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "-password -resetOtp -resetOtpExpiry"
    );

    return res.json({ success: true, doctors });
  } catch (err) {
    console.error("GET DOCTORS ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error while fetching doctors" });
  }
});

// ============================================================
//  GET ALL PATIENTS (Admin Only)
// ============================================================
router.get("/patients", auth(["admin"]), async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select(
      "-password -resetOtp -resetOtpExpiry"
    );

    return res.json({ success: true, patients });
  } catch (err) {
    console.error("GET PATIENTS ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error while fetching patients" });
  }
});

// ============================================================
//  DELETE DOCTOR (Admin Only)
// ============================================================
router.delete("/delete-doctor/:id", auth(["admin"]), async (req, res) => {
  try {
    const doctorId = req.params.id;

    const doctor = await User.findOneAndDelete({
      _id: doctorId,
      role: "doctor",
    });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    return res.json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (err) {
    console.error("DELETE DOCTOR ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error while deleting doctor" });
  }
});

// ============================================================
//  EDIT DOCTOR (Admin Only)
// ============================================================
router.put("/edit-doctor/:id", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, phone, speciality } = req.body;

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: "doctor" },
      { name, email, phone, speciality },
      { new: true }
    ).select("-password -resetOtp -resetOtpExpiry");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    return res.json({
      success: true,
      message: "Doctor updated successfully",
      doctor: updated,
    });
  } catch (err) {
    console.error("EDIT DOCTOR ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error while editing doctor" });
  }
});

// ============================================================
//  PUBLIC ROUTE FOR PATIENT DASHBOARD TO FETCH DOCTORS
// ============================================================
router.get("/public/doctors", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "-password -resetOtp -resetOtpExpiry"
    );

    return res.json({ success: true, doctors });
  } catch (err) {
    console.error("PUBLIC DOCTORS ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error while fetching doctors" });
  }
});

// ============================================================
//  GET ALL APPOINTMENTS (Admin Only)
// ============================================================
router.get("/appointments", auth(["admin"]), async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate("patient", "name")
      .populate("doctor", "name");

    const formatted = appts.map((a) => ({
      _id: a._id,
      patientName: a.patient ? a.patient.name : "Unknown",
      doctorName: a.doctor ? a.doctor.name : "Unknown",
      date: a.date,
      timeSlot: a.timeSlot,
      status: a.status,
    }));

    return res.json({ success: true, appointments: formatted });
  } catch (err) {
    console.error("ADMIN GET APPOINTMENTS ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
});
// ============================================================
//  UPDATE APPOINTMENT STATUS (Admin Only)
//  PATCH /api/admin/appointments/:id/status
//  body: { status: "Pending" | "Confirmed" | "Completed" | "Cancelled" }
// ============================================================
router.patch("/appointments/:id/status", auth(["admin"]), async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("patient", "name")
      .populate("doctor", "name");

    if (!appt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res.json({
      success: true,
      message: "Status updated",
      appointment: {
        _id: appt._id,
        patientName: appt.patient ? appt.patient.name : "Unknown",
        doctorName: appt.doctor ? appt.doctor.name : "Unknown",
        date: appt.date,
        timeSlot: appt.timeSlot,
        status: appt.status,
      },
    });
  } catch (err) {
    console.error("ADMIN UPDATE APPOINTMENT STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
// GET /api/admin/patients
// Admin can view all patients (name/email/phone)
router.get("/patients", auth(["admin"]), async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" })
      .select("name email phone createdAt")   // only needed fields
      .sort({ name: 1 })
      .lean();

    return res.json({ success: true, patients });
  } catch (err) {
    console.error("ADMIN PATIENTS ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to load patients" });
  }
});

module.exports = router;
