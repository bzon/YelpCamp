process.env.PORT = 3001;

var options = {
    url: 'http://localhost',
    port: process.env.PORT,
};

var app =  require("../app.js");
var should = require('should'); 
var supertest = require('supertest');
var assert = require('assert');
var async = require('async');

var server = supertest.agent("http://localhost:"+ process.env.PORT + "/");

describe(' YelpCamp Unit Testing ', function() {
  // Get Viewable Routes

  var randomString = function() {
      var stringVal = Math.random().toString(36).slice(2); 
      return stringVal;
  }

  var __randomUser = "tester_" + randomString();
  var __campgroundId;
  var __commentId;

  it("Get Registration Page", function (done) {
        server
            .get("register")
            //.set('authorization', 'Token ' + entAccessToken)
            .expect("Content-type", 'text/html; charset=utf-8')
            .expect(200)
            .end(function (err, res) {
              if(err) {
                console.log(err);
                done(err);
              } else {
                done();
              }
            });
  });

  it("Get Login Page", function (done) {
        server
            .get("login")
            .expect("Content-type", 'text/html; charset=utf-8')
            .expect(200)
            .end(function (err, res) {
              if(err) {
                console.log(err);
                done(err);
              } else {
                done();
              }
            });
  });

  // Create User Test Data
  it("Post Test Data Registration", function(done) {
    server
          .post("register")
          .send({
            'username': __randomUser,
            'email': __randomUser + "@gmail.com",
            'fullName': __randomUser,
            'password': __randomUser,
            'captchaByPass': '0g6k9wkdJ9jwfjw31qawgJJJJx'
          })
          .type('form')
          .expect(302)
          .end(function (err, res) {
              if(err) {
                console.log(err);
                done(err);
              } else {
                done();
              }
          });
  });

   // Log in User Test Data
  it("Post Test Data Log In", function(done) {

    server
          .post("login")
          .send({
            'username': __randomUser,
            'password': __randomUser
          })
          .type('form')
          .expect(302)
          .end(function (err, res) {
              if(err) {
                console.log(err);
                done(err);
              } else {
                done();
              }
              
          });    
  });


  it("Get Campgrounds Page", function (done) {
        server
            .get("campgrounds")
            .expect("Content-type", 'text/html; charset=utf-8')
            .expect(200)
            .end(function (err, res) {
               if(err) {
                console.log(err);
                done(err);
              } else {
                done();
              }
            });
  });

  it("Get New Campgrounds Page", function (done) {
        server
            .get("campgrounds/new")
            .expect("Content-type", 'text/html; charset=utf-8')
            .expect(200)
            .end(function (err, res) {
              if(err) {
                console.log(err);
                done(err);
              } else {
                done();
              }
            });
  });

it("Post Test Data New Campgrounds", function(done) {

    server
          .post("campgrounds")
          .send({
            'name': __randomUser,
            'price': '2000',
            'image': 'http://hvparent.com/_content/articles/Camps/what%20to%20take%20to%20Hudson%20Valley%20camps.jpg',
            'description': 'Test Data for Campgrounds'
          })
          .type('form')
          .expect(302)
          .end(function (err, res) {
              if(err) {
                console.log(err);
                done(err);
              } else {
                __campgroundId = res.header.location.split("=");
                __campgroundId = __campgroundId[1];
                done();
              }
              
          });    
  });

  it("Get Newly Added Campground Page", function(done) {

    server
        .get("campgrounds/" + __campgroundId)
        .expect(200)
        .end(function (err, res) {
            if(err) {
              console.log(err);
              done(err);
            } else {
              done();
            }
            
        });    
  });

  it("Get Add Comment Page", function(done) {

    server
        .get("campgrounds/" + __campgroundId + "/comments/new")
        .expect(200)
        .end(function (err, res) {
            if(err) {
              console.log(err);
              done(err);
            } else {
              done();
            }
            
        });    
  });

  it("Post Test Data Add Comment", function(done) {

    server
        .post("campgrounds/" + __campgroundId + "/comments")
        .send({ 
          'id': __campgroundId,
          'comment': {
            text: 'This is a test comment.'
          }
        })
        .type('form')
        .expect(302)
        .end(function (err, res) {
            if(err) {
              console.log(err);
              done(err);
            } else {
              __commentId = res.header.location.split("=");
              __commentId = __commentId[1];
              done();
            }
            
        });    
  });

  it("Comment Test Data Tear Down", function(done) {

    server
        .delete("campgrounds/" + __campgroundId + "/comments/" + __commentId)
        .expect(302)
        .end(function (err, res) {
            if(err) {
              console.log(err);
              done(err);
            } else {
              done();
            }
            
        });    
  });

  it("Campground Test Data Tear Down", function(done) {

    server
        .post("campgrounds/" + __campgroundId + "/remove")
        .send({ 
          'authKey': 'asd9asdkAS33qnwJJgpw011af'
        })
        .type('form')
        .expect(302)
        .end(function (err, res) {
            if(err) {
              console.log(err);
              done(err);
            } else {
              done();
            }
            
        });    
  });

  it("User Test Data Tear Down", function(done) {

    server
        .post("remove")
        .send({ 
          'authKey': 'asd9asdkAS33qnwJJgpw011af',
          'username': __randomUser
        })
        .type('form')
        .expect(302)
        .end(function (err, res) {
            if(err) {
              console.log(err);
              done(err);
            } else {
              done();
            }
            
        });    
  });



});


