var express = require("express"); 
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var seeds = require("../seeds");

// Index Route
router.get("/", function(req, res) {
    // Get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds){
        if(err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });

    //Delete User if Tester Only
    
    if(req.query.user != undefined && req.query.user != null && req.query.user != "") {

        var newUsername = req.query.user.split("_");
        newUsername = newUsername[0];

        if(newUsername == "tester") {
            seeds.removeSingleTestData("user", req.query.user, "ULE@shrU291#$vkf0124sf^");
        }
    }
});

// Create Route
router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
       if(err) {
           console.log(err);
       } else {
            // redirect back to campgrounds page
            //console.log(newlyCreated);
            res.redirect("/campgrounds?id=" + newlyCreated._id);    
       }
    });
});

// New Route
router.get("/new", middleware.isLoggedIn, function(req ,res) {
    res.render("campgrounds/new");
});

// Show Route
router.get("/:id", function(req, res) {
    var campgrounds;
    Campground.find({}, function(err, allCampgrounds){
        if(err) {
            console.log(err);
        } else {
            campgrounds = allCampgrounds;
            // find the campground with provided ID
            Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/show", {campground: foundCampground, campgrounds: campgrounds});
                }
            });
        }
    });
});

// Edit Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// Delete Route
router.post("/:id/remove", middleware.checkCampgroundOwnership, function(req, res) {

    var deleteAuthCode = "asd9asdkAS33qnwJJgpw011af"

    if(req.body.authKey === deleteAuthCode) {
        Campground.findByIdAndRemove(req.params.id, function(err) {
            res.redirect("/campgrounds");
        });
    }

});

// Update Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            console.log(updatedCampground);
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// Destroy Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;
