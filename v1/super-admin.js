/*
Author: Jayamurugan
Description: super admin route
Routes: License
*/

// import plugin
var express = require("express");
var router = express.Router();
var dotenv = require("dotenv");
const {validate} = require('../middleware/session-validation');

dotenv.config();

var baseUrl = process.env.BASE_URL;

// license
router.get("/license",validate, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/license-management", {
    title: "License management",
    baseUrl: baseUrl,
    userDetails: userDetails,
    menu:'license'
  });
});

// license create
router.get("/license/create",validate, function (req, res, next) {
  let userDetails = req.session.userDetails;  
  res.render("pages/create-license-management", {
    title: "Createl new license",
    baseUrl: baseUrl,
    action: "create",
    id:0,
    userDetails: userDetails,
    menu:'license'
  });
});

// license edit
router.get("/license/edit/:id",validate, function (req, res, next) {
  let userDetails = req.session.userDetails;  
  res.render("pages/create-license-management", {
    title: "Update license",
    baseUrl: baseUrl,
    action: "edit",
    id:req.params.id,
    userDetails: userDetails,
    menu:'license'
  });
});

module.exports = router;
