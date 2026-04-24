const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schoolSchema = new Schema({
  name: { type: String, required: true },
  classes: [{
    className: { type: String, required: true },
    sections: [{ type: String }] // Sections like A, B, C
  }],
});

module.exports = mongoose.model('School', schoolSchema);