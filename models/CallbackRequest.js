// models/CallbackRequest.js
const mongoose = require('mongoose');

const CallbackRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  contacted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('CallbackRequest', CallbackRequestSchema);
