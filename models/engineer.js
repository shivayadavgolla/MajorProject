const mongoose = require('mongoose')
const dbconnect = require('../db')
const bcrypt = require('bcryptjs');

//Call the db to connect the mongo db
dbconnect()

// User Schema
const EngineerSchema = mongoose.Schema({
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
    contact: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    engineerType: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'engineer'
    }
});

const Engineer = module.exports = mongoose.model('Engineer', EngineerSchema);

module.exports.registerEngineer = function (newEngineer, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newEngineer.password, salt, (err, hash) => {
            if (err) {
                console.log(err);
            }
            newEngineer.password = hash;
            newEngineer.save(callback);
        });
    });
}

module.exports.getEngineerByUsername = function(username, callback){
    const query = {username: username}
    Engineer.findOne(query, callback);
}
  
module.exports.getEngineerById = function(id, callback){
    Engineer.findById(id, callback);
}

module.exports.getEngineersByType = function(engineerType, callback) {
    const query = { engineerType: engineerType };
    Engineer.find(query, callback);
};

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

