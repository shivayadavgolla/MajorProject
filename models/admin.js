const mongoose = require('mongoose')
const dbconnect = require('../db')
const bcrypt = require('bcryptjs')

//Call the db to connect the mongo db
dbconnect()

// User Schema
const AdminSchema = mongoose.Schema({
    name: {
        type: String
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    email:  {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default:'admin'
    },
    group: {
        type: String,
    }
});

const Admin = module.exports = mongoose.model('Admin', AdminSchema);

module.exports.registerAdmin = function (newAdmin, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) {
                console.log(err);
            }
            newAdmin.password = hash;
            newAdmin.save(callback);
        });
    });
}

module.exports.getAdminByUsername = function(username, callback){
    const query = {username: username}
    Admin.findOne(query, callback);
}
  
module.exports.getAdminById = function(id, callback){
    Admin.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

// module.exports.getEngineer = function(callback){
//     const query = {role: "jeng"}
//     User.find(query, callback);
// }

