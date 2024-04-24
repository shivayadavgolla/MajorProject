const mongoose = require('mongoose')
const dbconnect = require('../db')
//const Complaint = require('./complaint');
//const ComplaintMapping = require('./complaintMapping');
//Call the db to connect the mongo db
dbconnect()

// Complaint Schema
const ComplaintMappingSchema = mongoose.Schema({
    complaintID: {
        type: String,
        required: true
    },
    engineerUserName: {
        type: String,
        required: true
    }
});

const ComplaintMapping = module.exports = mongoose.model('ComplaintMapping', ComplaintMappingSchema);

module.exports.registerMapping = function (newComplaintMapping, callback) {
    newComplaintMapping.save(callback);
};
module.exports.getAllComplaintMappings = function () {
    return ComplaintMapping.find().exec();
};
module.exports.getAllComplaintMappingsByUserName = function (engineerUserName) {
    return ComplaintMapping.find({ engineerUserName: engineerUserName }).exec();
};
module.exports.getAllComplaintMappingsByGroup = function (adminGroup) {
    return ComplaintMapping.find({ group: adminGroup }).exec();
};
module.exports.getEngineerUserNameByComplaintID = function (complaintID, callback) {
    ComplaintMapping.findOne({ complaintID: complaintID }, 'engineerUserName', (err, mapping) => {
        if (err) {
            return callback(err, null);
        }
        if (!mapping) {
            return callback(new Error('Complaint ID not found'), null);
        }
        callback(null, mapping.engineerUserName);
    });
};

