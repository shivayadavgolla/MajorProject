const mongoose = require('mongoose')
const dbconnect = require('../db')
const bcrypt = require('bcryptjs')

//Call the db to connect the mongo db
dbconnect()

// User Schema
const SuperAdminSchema = mongoose.Schema({
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
        default:'superadmin'
    }
});

const SuperAdmin = module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);

module.exports.registerSuperAdmin = function (newSuperAdmin, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newSuperAdmin.password, salt, (err, hash) => {
            if (err) {
                console.log(err);
            }
            newSuperAdmin.password = hash;
            newSuperAdmin.save(callback);
        });
    });
}

module.exports.getSuperAdminByUsername = function(username, callback){
    const query = {username: username}
    SuperAdmin.findOne(query, callback);
}
  
module.exports.getSuperAdminById = function(id, callback){
    SuperAdmin.findById(id, callback);
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

