// controllers/publicCallbackController.js
const CallbackRequest = require('../models/CallbackRequest');

exports.createCallback = async (req, res) => {
  try {
    const { name = '', phone, message = '', source = '' } = req.body || {};

    if (!phone || String(phone).trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const cb = new CallbackRequest({
      name: String(name).trim(),
      phone: String(phone).trim(),
      message: String(message).trim(),
      // `contacted` defaults to false from model, timestamps auto-added
    });

    await cb.save();

    return res.status(201).json({ success: true, callback: cb, message: 'Callback saved' });
  } catch (err) {
    console.error('createCallback error', err);
    return res.status(500).json({ success: false, message: 'Server error creating callback' });
  }
};
