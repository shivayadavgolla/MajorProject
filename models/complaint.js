// File: complaint.js
const mongoose = require('mongoose');

// Complaint Schema
const ComplaintSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    contact: {
        type: String
    },
    desc: {
        type: String
    },
    status: {
        type: String,
        default: 'Unassigned'
    }
});

const Complaint = module.exports = mongoose.model('Complaint', ComplaintSchema);

module.exports.registerComplaint = function (newComplaint, callback) {
    newComplaint.save(callback);
}

module.exports.getAllComplaints = function (callback) {
    Complaint.find(callback);
}

module.exports.getComplaintsByEmail = function (email, callback) {
    Complaint.find({ email: email }, (err, complaints) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, complaints);
    });
};

module.exports.getComplaintById = function (id, callback) {
    Complaint.findById(id, callback);
}

module.exports.updateComplaintStatus = function (id, newStatus, callback) {
    Complaint.findByIdAndUpdate(
        id,
        { $set: { status: newStatus } },
        { new: true, useFindAndModify: false }, // Add the useFindAndModify option
        callback
    );
};


