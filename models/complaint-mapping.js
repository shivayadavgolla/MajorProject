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
    engineerName: {
        type: String,
        required: true
    }
});

const ComplaintMapping = module.exports = mongoose.model('ComplaintMapping', ComplaintMappingSchema);

module.exports.registerMapping = function (newComplaintMapping, callback) {
    newComplaintMapping.save(callback);
}
module.exports.getAllComplaintMappings = function () {
    return ComplaintMapping.find().exec();
};

