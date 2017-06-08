var express = require('express');
var router = express.Router();

var User = require('../models/user');

/*Server handles request to profile given a code entered on index page*/
router.get('/', function(req,res){
	if (req.query.code) {
		var code = req.query.code.replace(/[^0-9a-zA-Z]/gi, '');
	}
	if(code) {
		displayProfile(code, req, res);
	} else {
<<<<<<< HEAD
	    req.flash('error_msg', 'Please enter a code');
=======
		req.flash('error_msg', 'Please enter a code');
>>>>>>> 9c33c8f06d652f378edc6847c2ba02a240aed1a9
	    res.redirect('/');
    }
});

/*Displays the profile of the user with code 'code',
  or an error message if code does not exist */
function displayProfile(code, req, res) {
	User.getUserByCode(code, function(err,user){
		if(!user){
            req.flash('error_msg', 'No user found');
            res.redirect('/');
        } else if(err){
            req.flash('error_msg', 'Error encountered, please try again');
            res.redirect('/');
		} else{
            res.render('profile',{
			    displayUser: user
            });
        }
	});
}

module.exports = router;
