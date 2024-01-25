const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let User = require('../models/user');
let Complaint = require('../models/complaint');
let ComplaintMapping = require('../models/complaint-mapping');

// Home Page - Dashboard
// Home Page - Dashboard
//index.js

// ... (other imports and middleware)

// Add this route to handle the Close button click
// Add this route to handle the Close button click
//const User = require('../models/user'); // Make sure the path is correct

// Create a new user instance
const newUser = new User({
    name: "Shiva Yadav",
    username: "shivayadav",
    email: "shivayadav@example.com",
    password: "password",
    role: "admin" // or "admin" or any other role
});

// Call the registerUser function
User.registerUser(newUser, (err, user) => {
    if (err) {
        console.log(err);
    } else {
        console.log("User registered successfully:", user);
    }
});
router.post('/closeComplaint', async (req, res) => {
    try {
        const { complaintID } = req.body;

        // Update the complaint status to "Completed" in the database
        await Complaint.findByIdAndUpdate(complaintID, { status: 'Completed' });

        // Send a success response
        res.json({ success: true, message: 'Complaint closed successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

  

// ... (other routes)

// Import necessary modules

// ... other imports and middleware

// router.post('/', async (req, res) => {
//     const { complaintID } = req.body;

//     try {
//         // Update the status of the complaint to 'Completed'
//         await Complaint.updateComplaintStatus(complaintID, 'Completed');

//         // Optionally, you may want to update other logic related to the closure

//         res.json({ success: true, message: 'Complaint closed successfully' });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// });


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
router.get('/close-complaint/:complaintID', ensureAuthenticated, async (req, res, next) => {
    try {
        const complaintID = req.params.complaintID;
        const status = req.query.status; // Get the status from the query parameter

        // Update the complaint status to 'Completed' in the database
        const updatedComplaint = await Complaint.findOneAndUpdate(
            { _id: complaintID, status: 'In Progress' },
            { $set: { status: 'Completed' } },
            { new: true }
        );

        if (updatedComplaint) {
            // Redirect to the junior engineer page after updating the status
            res.redirect('/jeng');
        } else {
            // Handle the case where the complaint was not updated (status may not be 'In Progress')
            console.error('Error: Complaint not updated');
            res.status(400).send('Bad Request');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});
//index.js

// ... (other imports and middleware)


// ... (other routes)

// Register Form
router.get('/register', (req, res, next) => {
    res.render('register');
});

router.get('/addUser',(req,res,next)=>{
    res.render('addUser');
})

// Logout
router.get('/logout', ensureAuthenticated,(req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

// Admin
router.get('/admin', ensureAuthenticated, (req,res,next) => {
    try{
    const complaints= Complaint.getAllComplaints();
    Complaint.getAllComplaints((err, complaints) => {
        if (err) throw err;
        const plainComplaints = complaints.map(complaint => complaint.toObject());
        const complaintsCount = complaints.length;
        const inProgressComplaints = complaints.filter(complaint => complaint.status === 'In Progress');
        const completedComplaints = complaints.filter(complaint => complaint.status === 'Completed');

        const inProgressCount = inProgressComplaints.length;
        const completedCount = completedComplaints.length;


        
        res.render('admin/admin', {
                name:req.user.name,
                complaints : plainComplaints,
                complaintsCount: complaints,
                in_progress: inProgressCount,
                completed : completedCount
            });
    }); 
}     
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
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
router.post('/assign', (req, res, next) => {
    const complaintID = req.body.complaintID;
    const engineerName = req.body.engineerName;

    req.checkBody('complaintID', 'Complaint ID field is required').notEmpty();
    req.checkBody('engineerName', 'Engineer name field is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/admin', {
            errors: errors
        });
    } else {
        // Update the status of the complaint to 'In Progress'
        Complaint.updateComplaintStatus(complaintID, 'In Progress', (err, updatedComplaint) => {
            if (err) {
                console.error('Error updating complaint status:', err);
                req.flash('error_msg', 'Failed to update complaint status');
                res.redirect('/admin');
            } else {
                // Create a new ComplaintMapping entry
                const newComplaintMapping = new ComplaintMapping({
                    complaintID: complaintID,
                    engineerName: engineerName,
                });

                ComplaintMapping.registerMapping(newComplaintMapping, (err, mapping) => {
                    if (err) {
                        console.error('Error registering complaint mapping:', err);
                        req.flash('error_msg', 'Failed to register complaint mapping');
                        res.redirect('/admin');
                    } else {
                        req.flash('success_msg', 'You have successfully assigned a complaint to an engineer');
                        res.redirect('/admin');
                    }
                });
            }
        });
    }
});

// Assuming you're using Express.js
router.get('/getAssignedEngineer/:complaintId', async (req, res) => {
    try {
        const complaintId = req.params.complaintId;

        // Find the corresponding complaint mapping
        const complaintMapping = await ComplaintMapping.findOne({ complaintID: complaintId });

        if (complaintMapping) {
            // Send the assigned engineer name in the response
            res.json({ engineerName: complaintMapping.engineerName });
        } else {
            res.status(404).json({ error: 'Complaint mapping not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/jeng', ensureAuthenticated, async (req, res, next) => {
    try {
        // Get the username (engineerName) of the logged-in junior engineer
        const engineerName = req.user.username;

        // Find all complaint mappings for the logged-in junior engineer
        const complaintsMapping = await ComplaintMapping.find({ engineerName });

        if (!complaintsMapping || !Array.isArray(complaintsMapping)) {
            console.error('Error: Invalid data format for complaintsMapping');
            res.status(500).send('Internal Server Error');
            return;
        }

        // Fetch the details of assigned complaints based on the mappings
        const assignedComplaints = [];
        for (const mapping of complaintsMapping) {
            const foundComplaint = await Complaint.findById(mapping.complaintID);
            if (foundComplaint) {
                assignedComplaints.push(foundComplaint.toObject());
            }
        }

        const totalComplaints = assignedComplaints.length;
        const inProgressCount = assignedComplaints.filter(complaint => complaint.status === 'In Progress').length;
        const completedCount = assignedComplaints.filter(complaint => complaint.status === 'Completed').length;

        res.render('junior/junior', {
            name: req.user.name,
            complaints: assignedComplaints,
            completed_count : completedCount,
            in_progressCount: inProgressCount,
            complaintTotal : totalComplaints
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// router.post('/update-status', async (req, res) => {
//     try {
//         const complaintID = req.body.complaintID;

//         // Update the status of the complaint to 'In Progress' or any desired status
//         const stus=req.body.status;
//         await Complaint.findByIdAndUpdate(complaintID, { status: 'In Progress' });

//         res.redirect('/jeng'); // Redirect back to the Junior Engineer page
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

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

// Assuming Express.js syntax
router.post('/completed', (req, res) => {
    // Retrieve complaint details from the request body
    const complaintID = req.body.complaintID;

    // Retrieve completion message based on complaintID
    const completionMessage = getCompletionMessage(complaintID);

    // Render the 'completed' view with completion message
    res.render('completed', {
        completionMessage: completionMessage
    });
});

router.post('/in-progress', (req, res) => {
    // Retrieve complaint details from the request body
    const complaintID = req.body.complaintID;

    // Retrieve assigned engineer details based on complaintID
    const assignedTo = getAssignedEngineer(complaintID);

    // Render the 'in-progress' view with assigned engineer details
    res.render('in-progress', {
        assignedTo: assignedTo
    });
});

router.post('/complete', async (req, res) => {
    try {
        const complaintID = req.body.complaintID;

        // Update the status of the complaint to 'Completed'
        await Complaint.findByIdAndUpdate(complaintID, { status: 'Completed' });

        res.redirect('/jeng'); // Redirect back to the Junior Engineer page
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
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