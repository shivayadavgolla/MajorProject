const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const LocalStrategy = require('passport-local').Strategy;

let User1 = require('../models/user1');
let Admin = require('../models/admin');
let Engineer = require('../models/engineer');
let SuperAdmin=require('../models/superadmin');
let Category = require('../models/category');
let Complaint = require('../models/complaint');
let ComplaintMapping = require('../models/complaint-mapping');


const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail', 'Outlook', etc.
    auth: {
        user: 'gollashivakumaryadavsky@gmail.com', // Your email address
        pass: 'mbuv cfff fkvf tifm' // Your email password
    }
});

// const newCategory = new Category({
//     group: "Yadav",
//     category: "Shiva"
// });

// Category.registerCategory(newCategory, (err, category)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("Category registered successfully");
//     }
// });
 const newSuperAdmin = new SuperAdmin({
     name: "Super Admin",
     username: "superadmin",
     email: "gollashivakumaryadavsky@gmail.com",
     password: "superadmin",
     role: "superadmin" 
 });

 SuperAdmin.registerSuperAdmin(newSuperAdmin, (err, superadmin) => {
     if (err) {
         console.log(err);
     } else {
         console.log("Admin registered successfully:", superadmin);
     }
 });

// const newAdmin = new Admin({
//     name: "Shiva Yadav",
//     username: "shivayadav",
//     email: "shivayadav@example.com",
//     password: "password",
//     role: "admin" 
// });

// Admin.registerAdmin(newAdmin, (err, admin) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Admin registered successfully:", admin);
//     }
// });

// const newUser1=new User1({
//     name: "Reshma",
//     username:"reshma",
//     email:"reshma@gmail.com",
//     password:"reshma",
//        role: 'user1',
// })

// User1.registerUser1(
//     newUser1,(err,user1)=>{
//         if(err){
//             console.log(err);
//         }
//         else{
//             console.log("User1 registered successfully:", user1);
//         }
// });

// const newEngineer=new Engineer({
//     name: "Madhu",
//     username:"madhu",
//     email:"madhu@gmail.com",
//     password:"madhu",
//     role: 'engineer',
// })

// Engineer.registerEngineer(
//     newEngineer,(err,engineer)=>{
//         if(err){
//             console.log(err);
//         }
//         else{
//             console.log("Engineer registered successfully:", engineer);
//         }
// });



// router.post('/closeComplaint', async (req, res) => {
//     try {
//         const { complaintID } = req.body;

//         // Update the complaint status to "Completed" in the database
//         await Complaint.findByIdAndUpdate(complaintID, { status: 'Completed' });

//         // Send a success response
//         console.log("closed");
//         res.json({ success: true, message: 'Complaint closed successfully' });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// });

router.post('/unassigned',async (req,res)=>{
    res.render('unassigned');
});

// Assuming you're using Express.js
router.get('/manageCategory', async (req, res, next) => {
    try {
        // Fetch all groups from the Category database
        const groups = await Category.distinct('group');
        
        //console.log(groups);
        // Fetch all categories from the Category database
        const categories = await Category.find({}, 'group category');

        // Organize categories by group
        const categorizedCategories = {};
        categories.forEach(category => {
            if (!categorizedCategories[category.group]) {
                categorizedCategories[category.group] = [];
            }
            categorizedCategories[category.group].push(category.category);
        });

        // Render the 'manageCategory' view with the fetched groups and categories
        res.render('manageCategory', { groups, categorizedCategories });
    } catch (error) {
        next(error); // Pass any errors to the error handler middleware
    }
});

router.post('/deleteCategory',ensureAuthenticated, async (req, res, next) => {
    try {
        const { group, category } = req.body;

        console.log(group);

        // Delete the category from the database
        await Category.deleteOneByName(group, category);

        // Redirect to the manageCategory page after deletion
        res.redirect('/manageCategory');
    } catch (error) {
        next(error); // Pass any errors to the error handler middleware
    }
});

router.post('/deleteGroup', ensureAuthenticated, async (req, res, next) => {
    try {
        const { group } = req.body;

        console.log(group);

        // Delete all categories belonging to the group from the database
        await Category.deleteByGroupName(group);

        // Redirect to the manageCategory page after deletion
        res.redirect('/manageCategory');
    } catch (error) {
        next(error); // Pass any errors to the error handler middleware
    }
});

router.get('/', async (req,res,next)=>{
    res.render('login');
});
router.get('/home', async (req,res,next)=>{
    res.render('home');
});

// router.get('/getAllComplaintMappings', ensureAuthenticated, (req, res) => {
//     const adminGroup = req.user.group; // Assuming the group information is stored in the user object

//     // Call the appropriate function to fetch complaint mappings for the admin's group
//     ComplaintMapping.getAllComplaintMappings(adminGroup)
//         .then(complaintMappings => {
//             // Create an array to store promises for fetching complaint and engineer details
//             const promises = [];

//             // Iterate through each complaint mapping to fetch complaint and engineer details
//             complaintMappings.forEach(mapping => {
//                 // Fetch the complaint details for the mapping
//                 const complaintPromise = new Promise((resolve, reject) => {
//                     Complaint.getComplaintById(mapping.complaintID, (err, complaint) => {
//                         if (err) {
//                             reject(err);
//                         } else {
//                             resolve({ type: 'complaint', data: complaint }); // Store complaint with type
//                         }
//                     });
//                 });

//                 // Fetch the engineer details for the mapping
//                 const engineerPromise = new Promise((resolve, reject) => {
//                     Engineer.getEngineerByUsername(mapping.engineerUserName, (err, engineer) => {
//                         if (err) {
//                             reject(err);
//                         } else {
//                             resolve({ type: 'engineer', data: engineer }); // Store engineer with type
//                         }
//                     });
//                 });

//                 // Push both promises into the promises array
//                 promises.push(complaintPromise, engineerPromise);
//             });

//             // Resolve all promises and wait for them to complete
//             Promise.all(promises)
//                 .then(results => {
//                     // Combine complaints and engineers into a single array
//                     const combinedData = results.reduce((acc, curr) => {
//                         if (curr.type === 'complaint') {
//                             acc.complaints.push(curr.data);
//                         } else if (curr.type === 'engineer') {
//                             acc.engineers.push(curr.data);
//                         }
//                         return acc;
//                     }, { complaints: [], engineers: [] });

//                     // Render the 'getAllComplaintMappings' view with the fetched details
//                     console.log(combinedData);
//                     res.render('getAllComplaintMappings', { combinedData }); // Pass combinedData as an object
//                 })
//                 .catch(err => {
//                     // Handle any errors that occur during the database operation
//                     console.error('Error fetching complaint and engineer details:', err);
//                     res.status(500).json({ error: 'Error fetching complaint and engineer details' });
//                 });
//         })
//         .catch(err => {
//             // Handle any errors that occur during the database operation
//             console.error('Error fetching complaint mappings:', err);
//             res.status(500).json({ error: 'Error fetching complaint mappings' });
//         });
// });


router.get('/getAllComplaintMappings', ensureAuthenticated, (req, res) => {
    const adminGroup = req.user.group; // Assuming the group information is stored in the user object

    // Call the appropriate function to fetch all complaint mappings for the admin's group
    ComplaintMapping.getAllComplaintMappingsByGroup(adminGroup)
        .then(complaintMappings => {
            // If complaint mappings are found, send them as a response
            console.log(complaintMappings);
            res.render('getAllComplaintMappings', { complaintMappings: complaintMappings });
            // Here, { complaintMappings: complaintMappings } is an object where the key is 'complaintMappings'
            // and the value is the fetched complaintMappings array.
        })
        .catch(err => {
            // If an error occurs during the database operation, send an error response
            console.error('Error fetching complaint mappings:', err);
            res.status(500).json({ error: 'Error fetching complaint mappings' });
        });
});


router.get('/addCategory', async (req, res, next) => {
    try {
        // Fetch all groups from the Category database
        const groups = await Category.distinct('group');
        
        // Fetch all categories from the Category database
        const categories = await Category.find({}, 'group category');

        // Organize categories by group
        const categorizedCategories = {};
        categories.forEach(category => {
            if (!categorizedCategories[category.group]) {
                categorizedCategories[category.group] = [];
            }
            categorizedCategories[category.group].push(category.category);
        });

        res.render('addCategory', { groups, categorizedCategories }); // Pass the groups and categorizedCategories to the template
    } catch (error) {
        next(error);
    }
});

router.get('/addEngineer', ensureAuthenticated, (req, res, next) => {
    // Assuming the group information is stored in req.user
    const adminGroup = req.user.group;
    res.render('addEngineer', { adminGroup: adminGroup });
});


router.get('/addAdmin', async (req, res, next) => {
    try {
        // Fetch distinct groups from the Category collection
        const groupNames = await Category.distinct('group');

        // Render the addAdmin page with distinct group names
        res.render('addAdmin', { groups: groupNames });
    } catch (err) {
        console.error('Error fetching distinct groups:', err);
        // Handle error, render an error page or redirect as necessary
        res.status(500).send('Error fetching groups');
    }
});



router.get('/addSuperAdmin',(req,res,next)=>{
    res.render('addSuperAdmin');
});

// Login Form
router.get('/login', (req, res, next) => {
    res.render('login');
});

// router.get('/logout',(req,res,next)=>{
//     res.render('logout');
// });

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

router.get('/registerUser', (req, res, next) => {
    res.render('registerUser');
});

router.get('/addUser',(req,res,next)=>{
    res.render('addUser');
})

// Logout
router.get('/logout', ensureAuthenticated, (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err); // Pass the error to the next middleware
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
});

router.get('/user1', ensureAuthenticated, (req, res, next) => {
    const userEmail = req.user.email;

    Complaint.getComplaintsByEmail(userEmail, (err, userComplaints) => {
        if (err) throw err;

        // Convert Mongoose documents to plain JavaScript objects
        const plainComplaints = userComplaints.map(complaint => complaint.toObject());

        // Render the 'index' view with user information and complaints
        res.render('user1/user1', {
            name: req.user.name,
            complaints: plainComplaints,
        });
    });
});

router.get('/superadmin', ensureAuthenticated, async (req, res, next) => {
    try {
        //console.log(req.user.name);
        const complaints = await Complaint.getAllComplaints();
        const complaintMappings = await ComplaintMapping.getAllComplaintMappings();
        
        Complaint.getAllComplaints((err, complaints) => {
            if (err) throw err;
            const plainComplaints = complaints.map(complaint => {
                const plainComplaint = complaint.toObject();
                // Assuming imagePath is the field containing the path to the image
                console.log("File name:", complaint.img.filename);
                plainComplaint.imagePath = `/uploads/`; // Adjust this based on your schema
                return plainComplaint;
            });
            const complaintsCount = complaints.length;
            const inProgressComplaints = complaints.filter(complaint => complaint.status === 'In Progress');
            const completedComplaints = complaints.filter(complaint => complaint.status === 'Completed');
            const inProgressCount = inProgressComplaints.length;
            const completedCount = completedComplaints.length;

            res.render('superadmin/superadmin', {
                name: req.user.name,
                complaints: plainComplaints,
                complaintsCount: complaints,
                in_progress: inProgressCount,
                completed: completedCount,
                complaintMappings: complaintMappings.map(mapping => mapping.toObject())
            });
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/admin', ensureAuthenticated, (req, res) => {
    const adminGroup = req.user.group; // Assuming the group information is stored in req.user
    
    Complaint.getComplaintsByGroup(adminGroup, (err, complaints) => {
        if (err) {
            res.render('error', { error: err }); // Render an error page if there's an error
        } 
        else{
            Engineer.find({ engineerType: adminGroup }, '', (err, engineers) => { // Pass empty string to fetch all fields
                if (err) {
                    console.error(err);
                    // Handle error
                    res.status(500).send('Internal Server Error');
                    return;
                }
                else {
                    const plainEngineers = engineers.map(engineer => engineer.toObject());
            
                    const plainComplaints = complaints.map(complaint => {
                                    const plainComplaint = complaint.toObject();
                                    // Assuming imagePath is the field containing the path to the image
                                    console.log("File name:", complaint.img.filename);
                                    plainComplaint.imagePath = `/uploads/`; // Adjust this based on your schema
                                    return plainComplaint;
                        });
                        const complaintsCount = complaints.length;
                        const inProgressComplaints = complaints.filter(complaint => complaint.status === 'In Progress');
                        const completedComplaints = complaints.filter(complaint => complaint.status === 'Completed');
                        const inProgressCount = inProgressComplaints.length;
                        const completedCount = completedComplaints.length;
                    res.render('admin/admin', {name: req.user.name, complaints: plainComplaints,
                                    complaintsCount: complaintsCount,
                                    in_progress: inProgressCount,
                                    completed: completedCount,
                                    engineers: plainEngineers });
                }
            });
        } 
       
    });
});


router.get('/jeng', ensureAuthenticated, (req, res) => {
    const engineerUserName = req.user.username; // Assuming the engineer's username is stored in req.user.username

    ComplaintMapping.getAllComplaintMappingsByUserName(engineerUserName)
        .then(complaintMappings => {
            const complaintIds = complaintMappings.map(mapping => mapping.complaintID);

            // Fetching complaint details for each complaintID
            const promises = complaintIds.map(complaintId => {
                return new Promise((resolve, reject) => {
                    Complaint.getComplaintById(complaintId, (err, complaint) => {
                        if (err || !complaint) {
                            reject(err || new Error('Complaint not found'));
                        } else {
                            resolve(complaint);
                        }
                    });
                });
            });

            Promise.all(promises)
                .then(complaints => {
                    const assignedComplaints = []; // Initialize an array to store assigned complaints
                    for (const complaint of complaints) {
                        assignedComplaints.push(complaint.toObject());
                    }
                    console.log(assignedComplaints);
                    const totalComplaints = assignedComplaints.length;
                    const inProgressCount = assignedComplaints.filter(complaint => complaint.status === 'In Progress').length;
                    const completedCount = assignedComplaints.filter(complaint => complaint.status === 'Completed').length;
                    res.render('junior/junior', { name: req.user.name,
                                    complaints: assignedComplaints,
                                    completed_count: completedCount,
                                    in_progressCount: inProgressCount,
                                    complaintTotal: totalComplaints });
                })
                .catch(err => {
                    res.render('error', { error: err }); // Render an error page if there's an error
                });
        })
        .catch(err => {
            res.render('error', { error: err }); // Render an error page if there's an error
        });
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



//Complaint
router.get('/complaint', ensureAuthenticated, async (req, res, next) => {
    try {
        // Fetch all categories from the Category database
        const categories = await Category.find({}, 'group category');

        // Organize categories by group
        const categorizedCategories = {};
        categories.forEach(category => {
            if (!categorizedCategories[category.group]) {
                categorizedCategories[category.group] = [];
            }
            categorizedCategories[category.group].push(category.category);
        });

        res.render('complaint', {name: req.user.name,email: req.user.email, categorizedCategories });
    } catch (error) {
        next(error);
    }
});




//Register a Complaint
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Specify the file name
    }
});

// Set up multer upload middleware
const upload = multer({ storage: storage });



// router.post('/registerComplaint', upload.single('image'), (req, res) => {
//     const name = req.body.name;
//     const email = req.body.email;
//     const contact = req.body.contact;
//     const desc = req.body.desc;
//     const category = req.body.category;

//     // Fetch the group corresponding to the category
//     Category.findOne({ category: category }, (err, categoryInfo) => {
//         if (err) {
//             console.error('Error fetching category:', err);
//             req.flash('error_msg', 'Error registering complaint');
//             res.redirect('/user1');
//             return;
//         }

//         const group = categoryInfo ? categoryInfo.group : '';

//         // Check if there is an uploaded image
//         let img = '';
//         if (req.file && req.file.filename) {
//             img = req.file.filename;
//         }

//         console.log('img:', img);

//         // Validate request body
//         req.checkBody('contact', 'Contact field is required').notEmpty();
//         req.checkBody('category', 'Category field is required').notEmpty();
//         req.checkBody('desc', 'Description field is required').notEmpty();
//         req.checkBody('email','Email field is required').notEmpty();

//         let errors = req.validationErrors();

//         if (errors) {
//             res.render('complaint', {
//                 errors: errors
//             });
//         } else {
//             const newComplaint = new Complaint({
//                 name: name,
//                 email: email,
//                 contact: contact,
//                 desc: desc,
//                 category: category,
//                 group: group,
//                 img: img
//             });

//             // Save the complaint to the database
//             Complaint.registerComplaint(newComplaint, (err, complaint) => {
//                 if (err) {
//                     console.error('Error registering complaint:', err);
//                     req.flash('error_msg', 'Error registering complaint');
//                     res.redirect('/user1');
//                 } else {
//                     console.log('Complaint registered successfully:', complaint);
//                     req.flash('success_msg', 'You have successfully launched a complaint');
//                     res.redirect('/user1');
//                 }
//             });
//         }
//     });
// });


router.post('/registerComplaint', upload.single('image'), (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const contact = req.body.contact;
    const desc = req.body.desc;
    const category = req.body.category;

    // Fetch the group corresponding to the category
    Category.findOne({ category: category }, (err, categoryInfo) => {
        if (err) {
            console.error('Error fetching category:', err);
            req.flash('error_msg', 'Error registering complaint');
            return res.redirect('/user1');
        }

        const group = categoryInfo ? categoryInfo.group : '';

        // Check if there is an uploaded image
        let img = '';
        if (req.file && req.file.filename) {
            img = req.file.filename;
        }

        console.log('img:', img);

        // Validate request body
        req.checkBody('contact', 'Contact field is required').notEmpty();
        req.checkBody('category', 'Category field is required').notEmpty();
        req.checkBody('desc', 'Description field is required').notEmpty();
        req.checkBody('email','Email field is required').notEmpty();

        let errors = req.validationErrors();

        if (errors) {
            return res.render('complaint', {
                errors: errors
            });
        }

        const newComplaint = new Complaint({
            name: name,
            email: email,
            contact: contact,
            desc: desc,
            category: category,
            group: group,
            img: img
        });

        // Save the complaint to the database
        Complaint.registerComplaint(newComplaint, (err, complaint) => {
            if (err) {
                console.error('Error registering complaint:', err);
                req.flash('error_msg', 'Error registering complaint');
                return res.redirect('/user1');
            }

            console.log('Complaint registered successfully:', complaint);
            req.flash('success_msg', 'You have successfully launched a complaint');

            // Construct email message
            const subject = 'New Complaint Registration';
            const text = `Name: ${name}\nEmail: ${email}\nContact Number: ${contact}\nGroup: ${group}\nCategory: ${category}\nDescription: ${desc}`;
        

            // Send email
            transporter.sendMail({
                from: 'gollashivakumaryadavsky@gmail.com', // Sender address
                to: email, // Recipient address
                subject: subject, // Subject line
                text: text // Plain text body
            }, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err);
                } else {
                    console.log('Email sent:', info.response);
                }
                // Redirect after sending email
                res.redirect('/user1');
            });
        });
    });
});

router.post('/assigned', (req, res, next) => {
    const { complaintID } = req.body;

    // Call the getCustomerDetailsByComplaintId function to fetch customer details
    Complaint.getCustomerDetailsByComplaintID(complaintID, (err, customerDetails) => {
        if (err) {
            console.error('Error fetching customer details:', err);
            // Handle error, render an error page or redirect as necessary
            res.status(500).send('Error fetching customer details');
            return;
        }

        // Call the getEngineerDetailsByComplaintId function to fetch engineer details
        ComplaintMapping.getEngineerUserNameByComplaintID(complaintID, (err, engineerUsername) => {
            if (err) {
                console.error('Error fetching engineer username:', err);
                // Handle error, render an error page or redirect as necessary
                res.status(500).send('Error fetching engineer username');
                return;
            }

            // Use the engineer username to fetch engineer details
            Engineer.getEngineerByUsername(engineerUsername, (err, engineerDetails) => {
                if (err) {
                    console.error('Error fetching engineer details:', err);
                    // Handle error, render an error page or redirect as necessary
                    res.status(500).send('Error fetching engineer details');
                    return;
                }

                // Render the 'assigned' view with customer and engineer details
                engineerDetails=engineerDetails.toObject();
                console.log(engineerDetails);
                res.render('assigned', { complaintID: complaintID, customerDetails: customerDetails, engineerDetails: engineerDetails });
            });
        });
    });
});



router.post('/addCategory', async (req, res) => {
    const categoryName = req.body.categoryName;
    const customGroup = req.body.customGroup;
    const categoryGroup = req.body.categoryGroup;

    // Validate request body
    if (!categoryGroup && !customGroup) {
        req.checkBody('categoryName', 'Category field is required').notEmpty();
        req.checkBody('customGroup', 'Category Group field is required').notEmpty();
    }

    let errors = req.validationErrors();

    if (errors) {
        res.render('addCategory', {
            errors: errors
        });
    } else {
        let groupToStore = '';

        if (categoryGroup) {
            groupToStore = categoryGroup;
        } else if (customGroup) {
            groupToStore = customGroup;
        }

        Category.findOne({category: categoryName }, (err, existingCategory) => {
            if (err) {
                console.error('Error finding category:', err);
                req.flash('error_msg', 'Error finding category');
                res.redirect('/superadmin');
            } else if (existingCategory) {
                // Category already exists
                req.flash('error_msg', 'Category already exists');
                res.redirect('/addcategory');
            } else {
                const newCategory = new Category({
                    group: groupToStore,
                    category: categoryName
                });

                // Save the category to the database
                Category.registerCategory(newCategory, (err, category) => {
                    if (err) {
                        console.error('Error registering category:', err);
                        req.flash('error_msg', 'Error registering category');
                        res.redirect('/superadmin');
                    } else {
                        console.log('Category registered successfully:', category);
                        req.flash('success_msg', 'Category registered successfully');
                        res.redirect('/superadmin');
                    }
                });
            }
        });
    }
});

router.post('/assignEng', ensureAuthenticated, (req, res, next) => {
    // Retrieve complaint details from the request body
    const { complaintID } = req.body;
    const adminGroup = req.user.group; // Assuming the group information is stored in req.user

    // Include more fields as needed

    // Render the 'assignEng' view with complaint details
    Engineer.find({ engineerType: adminGroup }, '', (err, engineers) => { // Pass empty string to fetch all fields
        if (err) {
            console.error(err);
            // Handle error
            res.status(500).send('Internal Server Error');
            return;
        }
        //console.log(engineers);
        
        const plainEngineers = engineers.map(engineer => engineer.toObject());
        res.render('assignEng', {
            complaintID: complaintID,
            engineers: plainEngineers,

            // Pass more details as needed
        });
    });
});



// Assign the Complaint to Engineer


// router.post('/assign', (req, res, next) => {
//     const complaintID = req.body.complaintID;
//     const engineerName = req.body.engineerName; // Modified to engineerName instead of engineerType

//     req.checkBody('complaintID', 'Complaint ID field is required').notEmpty();
//     req.checkBody('engineerName', 'Engineer Name field is required').notEmpty(); // Modified to engineerName

//     let errors = req.validationErrors();

//     if (errors) {
//         res.render('admin/admin', {
//             errors: errors
//         });
//     } else {
//         // Update the status of the complaint to 'Assigned'

//         Engineer.findOne({ username: engineerName }, 'email', (err, engineer) => {
//             if (err) {
//                 console.error('Error finding engineer:', err);
//                 req.flash('error_msg', 'Failed to find engineer');
//                 return res.redirect('/admin');
//             }
        
//             if (!engineer) {
//                 req.flash('error_msg', 'Engineer not found');
//                 return res.redirect('/admin');
//             }
        
//             const engineerEmail = engineer.email;
        
//             // Prepare email message
//             const mailOptions = {
//                 from: 'gollashivakumaryadavsky@gmail.com', // Sender address
//                 to: engineerEmail, // Engineer's email address
//                 subject: 'New Complaint Assigned', // Subject line
//                 text: `You have been assigned a new complaint (ID: ${complaintID}). Please review and take necessary action.` // Plain text body
//             };
        
//             // Send email
//             transporter.sendMail(mailOptions, (err, info) => {
//                 if (err) {
//                     console.error('Error sending email:', err);
//                     req.flash('error_msg', 'Error sending email');
//                 } else {
//                     console.log('Email sent:', info.response);
//                     req.flash('success_msg', 'Email sent to engineer');
//                 }
//                 res.redirect('/admin');
//             });
//         });

//         Complaint.updateComplaintStatus(complaintID, 'Assigned', (err, updatedComplaint) => {
//             if (err) {
//                 console.error('Error updating complaint status:', err);
//                 req.flash('error_msg', 'Failed to update complaint status');
//                 res.redirect('/admin');
//             } else {
//                 // Create a new ComplaintMapping entry
//                 const newComplaintMapping = new ComplaintMapping({
//                     complaintID: complaintID,
//                     engineerUserName: engineerName, // Modified to engineerName
//                 });

//                 // Save the ComplaintMapping to the database
//                 ComplaintMapping.registerMapping(newComplaintMapping, (err, mapping) => {
//                     if (err) {
//                         console.error('Error registering complaint mapping:', err);
//                         req.flash('error_msg', 'Failed to register complaint mapping');
//                         res.redirect('/admin');
//                     } else {
//                         req.flash('success_msg', 'You have successfully assigned a complaint to an engineer');
//                         res.redirect('/admin');
//                     }
//                 });
//             }
//         });
//     }
// });



router.post('/assign', async (req, res, next) => {
    const complaintID = req.body.complaintID;
    const engineerName = req.body.engineerName; // Modified to engineerName instead of engineerType

    req.checkBody('complaintID', 'Complaint ID field is required').notEmpty();
    req.checkBody('engineerName', 'Engineer Name field is required').notEmpty(); // Modified to engineerName

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/admin', {
            errors: errors
        });
    } else {
        try {
            // Update the status of the complaint to 'Assigned'
            
            // Get engineer email by username
            const engineer = await Engineer.findOne({ username: engineerName }, 'name email contact');

            if (!engineer) {
                req.flash('error_msg', 'Engineer not found');
                return res.redirect('/admin');
            }

            const engineerEmail = engineer.email;
            const engineerFullName = engineer.name;
            const engineerContact = engineer.contact;

            // Send email to engineer
            const engineerMailOptions = {
                from: 'gollashivakumaryadavsky@gmail.com',
                to: engineerEmail,
                subject: 'New Complaint Assigned',
                text: `Dear ${engineerFullName},\n\nYou have been assigned a new complaint (ID: ${complaintID}). Please review and take necessary action.\n\nThank you.`
            };

            await transporter.sendMail(engineerMailOptions);

            // Get customer details by complaint ID
            Complaint.getCustomerDetailsByComplaintID(complaintID, async (err, customerDetails) => {
                if (err) {
                    console.error('Error:', err);
                    return res.status(500).send('Internal Server Error');
                }
                
                // Send email to the customer
                const mailOptions = {
                    from: 'gollashivakumaryadavsky@gmail.com',
                    to: customerDetails.email, // Customer email address
                    subject: 'Your complaint has been Assigned',
                    text: `Dear ${customerDetails.name},\n\nYour complaint (ID: ${complaintID}) has been assigned to ${engineerFullName} for resolution. Please feel free to contact the engineer at ${engineerContact} if you have any further questions or concerns.\n\nThank you.`
                };
    
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });
    
 // Redirect back to the Junior Engineer page
            });
            // Create a new ComplaintMapping entry
            Complaint.updateComplaintStatus(complaintID, 'Assigned', (err, updatedComplaint) => {
                if (err) {
                    console.error('Error updating complaint status:', err);
                    req.flash('error_msg', 'Failed to update complaint status');
                    res.redirect('/admin');
                } else {
                    // Create a new ComplaintMapping entry
                    const newComplaintMapping = new ComplaintMapping({
                        complaintID: complaintID,
                        engineerUserName: engineerName, // Modified to engineerName
                    });
    
                    // Save the ComplaintMapping to the database
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
        } catch (error) {
            console.error('Error:', error);
            req.flash('error_msg', 'Internal Server Error');
            return res.redirect('/admin');
        }
    }
});


router.post('/addAdmin', ensureAuthenticated, (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const group = req.body.adminCategoryGroup;
    //console.log(group);
    const role = 'admin';

    req.checkBody('name', 'Name field is required').notEmpty();
   // req.checkBody('group', 'Group field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    //req.checkBody('role', 'Role option is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('addAdmin', {
            errors: errors
        });
    } else {
        const newAdmin = new Admin({
            name: name,
            username: username,
            email: email,
            password: password,
            role: role,
            group: group
        });

        Admin.registerAdmin(newAdmin, (err, user) => {
            if (err) throw err;
            req.flash('success_msg', 'Admin Successfully Registered!!!');
            res.redirect('/superadmin');
        });
    }
});

router.post('/addSuperAdmin', (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const role = 'superadmin';

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
   // req.checkBody('role', 'Role option is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('addSuperAdmin', {
            errors: errors
        });
    } else {
        const newSuperAdmin = new SuperAdmin({
            name: name,
            username: username,
            email: email,
            password: password,
            role: role
        });

        SuperAdmin.registerSuperAdmin(newSuperAdmin, (err, user) => {
            if (err) throw err;
            req.flash('success_msg', 'Super Admin Successfully Registered!!!');
            res.redirect('/superadmin');
        });
    }
});


router.post('/addEngineer', (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const role = 'engineer';
    const engineerType =req.body.engineerType;
    const contact = req.body.contact;

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('contact', 'Contact field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('engineerType', 'Engineer Type field is required').notEmpty();

   // req.checkBody('role', 'Role option is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('addEngineer', {
            errors: errors
        });
    } else {
        const newEngineer = new Engineer({
            name: name,
            username: username,
            email: email,
            contact: contact,
            password: password,
            role: role,
            engineerType: engineerType,
        });

        Engineer.registerEngineer(newEngineer, (err, engineer) => {
            if (err) throw err;
            console.log('assigned');
            req.flash('success_msg', 'Engineer Successfully Registered!!!');
            res.redirect('/admin');
        });
    }
});

router.post('/addUser', (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const role = 'user1';

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    //req.checkBody('role', 'Role option is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('addUser', {
            errors: errors
        });
    } else {
        const newUser1 = new User1({
            name: name,
            username: username,
            email: email,
            password: password,
            role: 'user1'
        });

        User1.registerUser1(newUser1, (err, user) => {
            if (err) throw err;
            req.flash('success_msg', 'User Successfully Registered!!!');
            res.redirect('/admin');
        });
    }
});

router.post('/registerUser', (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const role = 'user1';

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    //req.checkBody('role', 'Role option is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('registerUser', {
            errors: errors
        });
    } else {
        const newUser1 = new User1({
            name: name,
            username: username,
            email: email,
            password: password,
            role: 'user1'
        });

        User1.registerUser1(newUser1, (err, user1) => {
            if (err) throw err;
            req.flash('success_msg', 'You are Successfully Registered and can Log in');
            res.redirect('/login');
        });
    }
});


// Assuming Express.js syntax

router.post('/complete', async (req, res) => {
    try {
        const complaintID = req.body.complaintID;

        // Update the status of the complaint to 'Completed'
        await Complaint.findByIdAndUpdate(complaintID, { status: 'Completed' });

        // Get customer details by complaint ID
        Complaint.getCustomerDetailsByComplaintID(complaintID, async (err, customerDetails) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).send('Internal Server Error');
            }
            
            // Send email to the customer
            const mailOptions = {
                from: 'gollashivakumaryadavsky@gmail.com',
                to: customerDetails.email, // Customer email address
                subject: 'Your complaint has been completed',
                text: `Dear ${customerDetails.name}, your complaint ${complaintID} has been successfully resolved. Thank you for reaching out to us.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

            res.redirect('/jeng'); // Redirect back to the Junior Engineer page
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/take', async (req, res) => {
    try {
        const complaintID = req.body.complaintID;

        // Update the status of the complaint to 'Completed'
        await Complaint.findByIdAndUpdate(complaintID, { status: 'In Progress' });

        res.redirect('/jeng'); // Redirect back to the Junior Engineer page
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});







passport.use('user1-local', new LocalStrategy((username, password, done) => {
    User1.getUser1ByUsername(username, (err, user1) => {
        if (err) {
            return done(err);
        }
        if (!user1) {
            return done(null, false, { message: 'No user found' });
        }

        User1.comparePassword(password, user1.password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                //console.log('matched');
                return done(null, user1);
            } else {
                return done(null, false, { message: 'Wrong Password' });
            }
        });
    });
}));

// Define LocalStrategy for SuperAdmin

passport.use('superadmin-local', new LocalStrategy((username, password, done) => {
    SuperAdmin.getSuperAdminByUsername(username, (err, superadmin) => {
        if (err) {
            return done(err);
        }
        if (!superadmin) {
            return done(null, false, { message: 'No Super admin found' });
        }

        SuperAdmin.comparePassword(password, superadmin.password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, superadmin);
            } else {
                return done(null, false, { message: 'Wrong Password' });
            }
        });
    });
}));


// Define LocalStrategy for Admin
passport.use('admin-local', new LocalStrategy((username, password, done) => {
    Admin.getAdminByUsername(username, (err, admin) => {
        if (err) {
            return done(err);
        }
        if (!admin) {
            return done(null, false, { message: 'No admin found' });
        }

        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, admin);
            } else {
                return done(null, false, { message: 'Wrong Password' });
            }
        });
    });
}));

// Define LocalStrategy for Engineer
passport.use('engineer-local', new LocalStrategy((username, password, done) => {
    Engineer.getEngineerByUsername(username, (err, engineer) => {
        if (err) {
            return done(err);
        }
        if (!engineer) {
            return done(null, false, { message: 'No engineer found' });
        }

        Engineer.comparePassword(password, engineer.password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, engineer);
            } else {
                return done(null, false, { message: 'Wrong Password' });
            }
        });
    });
}));

// Serialize and deserialize user for all user types
passport.serializeUser((user, done) => {
    done(null, { id: user.id, role: user.role});
    //console.log('serializer');
    //console.log(`${user.email}`);
});

passport.deserializeUser((data, done) => {
    //console.log(`${data.id}`);
    //console.log(data.role);
    if (data.role === 'user1') {
        User1.getUser1ById(data.id, (err, user1) => {
            done(err, user1);
        });
    } else if (data.role === 'admin') {
        Admin.getAdminById(data.id, (err, admin) => {
            done(err, admin);
        });
    } else if (data.role === 'engineer') {
        Engineer.getEngineerById(data.id, (err, engineer) => {
            done(err, engineer);
        });
    } else if (data.role === 'superadmin') {
        SuperAdmin.getSuperAdminById(data.id, (err, superadmin) => {
            done(err, superadmin);
        });
    }else {
        //req.flash('select user type');
        done(new Error('Invalid user type'));
    }
});

// Modify login route to use different strategies based on user type
router.post('/login', (req, res, next) => {

    const { username, password, userType } = req.body;
    

    passport.authenticate(`${userType}-local`, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error_msg', info.message);
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            else{
                //console.log("redirected");
                req.session.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect(getRedirectUrl(userType));
                }); 
            }
           
        });
    })(req, res, next);
});


// Access control middleware
// Function to determine redirect URL based on user type
function getRedirectUrl(userType) {
    if (userType === 'user1') {
        //console.log("user login");
        return '/user1';
    } else if (userType === 'admin') {
        return '/admin';
    } else if (userType === 'engineer') {
        return '/jeng';
    } else if (userType === 'superadmin'){
        return '/superadmin';
    }
   return '#';
   
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        //console.log("Authenticated");
        return next();
    } else {
        req.flash('error_msg', 'You are not Authorized to view this page');
        res.redirect('/login');
    }
}



module.exports = router;