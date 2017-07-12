var express = require("express");
var passport = require("passport");
var https = require('https');
var querystring = require('querystring');
var router = express.Router();
var User = require("../models/user");

var createUser = function(req, res, byPassCode) {
    var newUser = new User({username: req.body.username, email: req.body.email, fullName: req.body.fullName});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp, " + req.body.username);

            // Add a User GET Variable - Accessible via req.query.<NAME> in the next route
            res.redirect("/campgrounds?user=" + req.body.username ); 
        });
    });
}

// root route
router.get("/", function(req, res) {
   res.render("home"); 
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

// handle sign up logic
router.post("/register", function(req, res){

    var byPassKey = "0g6k9wkdJ9jwfjw31qawgJJJJx";

    // For Testing Purposes ByPass Recaptcha
    if(req.body.captchaByPass === byPassKey) {
        createUser(req, res, req.body.captchaByPass);

    // Normal Registration
    } else {
        var verifyDetails = querystring.stringify({
            "secret": "6LcbxCMUAAAAAKPQmz8p628Wi02O6n7JaT6Pn6Go",
            "response": req.body["g-recaptcha-response"]
        })
        var postDetails = {
            method: "POST",
            path: "/recaptcha/api/siteverify",
            port: "443",
            host: "google.com",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        var recaptchaRequest = https.request(postDetails, function(recaptchaResponse) {
            recaptchaResponse.setEncoding('utf8');
            recaptchaResponse.on('data', function (verifiedData) {
                verifiedData = JSON.parse(verifiedData);
                if(verifiedData.success) {
                    createUser(req, res, "");
                } else {
                    console.log('There is something wrong with your object.' + verifiedData);
                }
            });
        });

        recaptchaRequest.write(verifyDetails);
        recaptchaRequest.end();
    }
    
});

// Delete Test User
router.post("/remove", function(req, res) {

    var deleteAuthCode = "asd9asdkAS33qnwJJgpw011af"
    var verifyUserTester = req.body.username.split("_");

    verifyUserTester = verifyUserTester[0];

    // console.log(req.body.username);
    // console.log(req.body.authKey);

    if(req.body.authKey === deleteAuthCode && verifyUserTester == "tester") {
        User.findOneAndRemove({ username: req.body.username }, function(err) {
            if(err) {
                console.log(err);
            } else {
                res.redirect("/logout");
            }

        });
    }

});

// show login form
router.get("/login", function(req, res) {
   res.render("login");
});

// handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res) {
});

// logout route
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "You have been logged out!");
   res.redirect("/login");
});

module.exports = router;
