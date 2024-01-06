const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let User = require('../models/user');
let Complaint = require('../models/complaint');
let ComplaintMapping = require('../models/complaint-mapping');

// Home Page - Dashboard
// Home Page - Dashboard
router.get('/', ensureAuthenticated, (req, res, next) => {
    const userEmail = req.user.email;

    Complaint.getComplaintsByEmail(userEmail, (err, userComplaints) => {
        if (err) throw err;

        // Convert Mongoose documents to plain JavaScript objects
        const plainComplaints = userComplaints.map(complaint => complaint.toObject());

        // Render the 'index' view with user information and complaints
        res.render('index', {
            name: req.user.name,
            complaints: plainComplaints,
        });
    });
});

// Login Form
router.get('/login', (req, res, next) => {
    res.render('login');
});

// Register Form
router.get('/register', (req, res, next) => {
    res.render('register');
});

// Logout
router.get('/logout', ensureAuthenticated,(req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

// Admin
router.get('/admin', ensureAuthenticated, (req,res,next) => {
    Complaint.getAllComplaints((err, complaints) => {
        if (err) throw err;
        const plainComplaints = complaints.map(complaint => complaint.toObject());
    
        res.render('admin/admin', {
                name:req.user.name,
                complaints : plainComplaints,
            });
    });        
});

//assigning cases to engineer
router.post('/assignEng', (req, res,next) => {
    // Retrieve complaint details from the request body
    // console.log(req.user._id);
    const complaintID = req.body._id;
    const customerName = req.body.customerName;
    
    // Include more fields as needed

    // Render the 'assignEng' view with complaint details
    User.getEngineer((err, engineers) => {
        if (err) throw err;
        const plainEngineers = engineers.map(engineer => engineer.toObject());
        res.render('assignEng', {
            complaintID: complaintID,
            engineer : plainEngineers,
            // customerName: customerName,
            // Pass more details as needed
        });
    });
    
});
// Assign the Complaint to Engineer
router.post('/assign', (req,res,next) => {
    const complaintID = req.body.complaintID;
    const engineerName = req.body.engineerName;

    req.checkBody('complaintID', 'Contact field is required').notEmpty();
    req.checkBody('engineerName', 'Description field is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/admin', {
            errors: errors
        });
    } else {
        const newComplaintMapping = new ComplaintMapping({
            complaintID: complaintID,
            engineerName: engineerName,
        });

        ComplaintMapping.registerMapping(newComplaintMapping, (err, complaint) => {
            if (err) throw err;
            req.flash('success_msg', 'You have successfully assigned a complaint to Engineer');
            res.redirect('/admin');
        });
    }

});

router.get('/jeng', ensureAuthenticated, async (req, res, next) => {
    try {
        const allComplaints = [];

        const complaintsMapping = await ComplaintMapping.getAllComplaintMappings();

        console.log('Retrieved complaintsMapping:', complaintsMapping);

        if (!complaintsMapping || !Array.isArray(complaintsMapping)) {
            // Handle the case where complaintsMapping is not iterable
            console.error('Error: Invalid data format for complaintsMapping');
            res.status(500).send('Internal Server Error');
            return;
        }

        for (const mapping of complaintsMapping) {
            const foundComplaint = await Complaint.findOne({ _id: mapping.complaintID });

            if (foundComplaint) {
                allComplaints.push(foundComplaint.toObject());
            }
        }

        // console.log('Retrieved complaints:', allComplaints);

        res.render('junior/junior', {
            name: req.user.name,
            complaints: allComplaints,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});






//Complaint
router.get('/complaint', ensureAuthenticated, (req, res, next) => {
    //console.log(req.session.passport.username);
    //console.log(user.name);
    res.render('complaint', {
        name: req.user.name,
        email:req.user.email,      
    });
});

//Register a Complaint
router.post('/registerComplaint', (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const contact = req.body.contact;
    const desc = req.body.desc;
    
    const postBody = req.body;
    console.log(postBody);

    req.checkBody('contact', 'Contact field is required').notEmpty();
    req.checkBody('desc', 'Description field is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('complaint', {
            errors: errors
        });
    } else {
        const newComplaint = new Complaint({
            name: name,
            email: email,
            contact: contact,
            desc: desc,
        });

        Complaint.registerComplaint(newComplaint, (err, complaint) => {
            if (err) throw err;
            req.flash('success_msg', 'You have successfully launched a complaint');
            res.redirect('/');
        });
    }
});



// Process Register
router.post('/register', (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const role = req.body.role;

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('role', 'Role option is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: password,
            role: role
        });

        User.registerUser(newUser, (err, user) => {
            if (err) throw err;
            req.flash('success_msg', 'You are Successfully Registered and can Log in');
            res.redirect('/login');
        });
    }
});

// Local Strategy
passport.use(new LocalStrategy((username, password, done) => {
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return done(null, false, {
                message: 'No user found'
            });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Wrong Password'
                });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    var sessionUser = {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
    }
    done(null, sessionUser);
});

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, sessionUser) => {
        done(err, sessionUser);
    });
});

// Login Processing
router.post('/login', passport.authenticate('local', 
    { 
        failureRedirect: '/login', 
        failureFlash: true 
    
    }), (req, res, next) => {
    
        req.session.save((err) => {
        if (err) {
            return next(err);
        }
        if(req.user.role==='admin'){
            res.redirect('/admin');
        }
        else if(req.user.role==='jeng'){
            res.redirect('/jeng');
        }
        else{
            res.redirect('/');
        }
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not Authorized to view this page');
        res.redirect('/login');
    }
}

module.exports = router;