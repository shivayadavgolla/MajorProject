// File: complaint.js
const dbconnect = require('../db');
const mongoose = require('mongoose');
const multer= require('multer');

dbconnect()
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
    category: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    img: { // Change field name to imgFileName
        type: String // Store only the filename
    },
    status: {
        type: String,
        default: 'Unassigned'
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically save current date and time
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

module.exports.getCustomerDetailsByComplaintID = function(complaintId, callback) {
    Complaint.findById(complaintId, (err, complaint) => {
        if (err || !complaint) {
            return callback(err || new Error('Complaint not found'), null);
        }
        
        // Extract customer details from the complaint
        const customerDetails = {
            name: complaint.name,
            email: complaint.email,
            contact: complaint.contact
        };
        
        callback(null, customerDetails);
    });
};

module.exports.registerComplaint = function (newComplaint, callback) {
    newComplaint.save((err, complaint) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, complaint);
    });
};

module.exports.getComplaintsByGroup = function (group, callback) {
    Complaint.find({ group: group }, callback);
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Specify the file name
    }
});

const upload = multer({ storage: storage });

module.exports.upload = upload.single('image'); // Single file upload middleware
