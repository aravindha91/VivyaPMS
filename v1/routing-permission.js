/*
Author: Jayamurugan
Description: Permission route
*/

// import plugin
var express = require("express");
var router = express.Router();
var dotenv = require("dotenv");
var _ = require('lodash');
const { validateAdmin, validateUser, validateSession,validatePermission } = require('../middleware/session-validation');

dotenv.config();
var baseUrl = process.env.BASE_URL;

// user
router.get("/user", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/user-details", {
    title: "User details",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'user'}),
    menu: 'user'
  });
});

// user create
router.get("/user/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/create-user", {
    title: "Create user",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'user'}),
    action: "create",
    id: 0,
    menu: 'user'
  });
});

// user edit
router.get("/user/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/create-user", {
    title: "Update user",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'user'}),
    action: "edit",
    id: req.params.id,
    menu: 'user'
  });
});

// document
router.get("/document-details", validatePermission, function (req, res, next) { 
  let userDetails = req.session.userDetails;
  res.render("pages/document-details", {
    title: "Document details",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'document-details'}),
    menu: 'document-details',
    reprocess:typeof req.query.reprocess == 'undefined' ?false:true 
  });
});

// quick checkin create
router.get("/quick-checkin/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/quick-checkin", {
    title: "Check in",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'quick-checkin'}),
    action: "create",
    id: req.params.id,
    menu: 'checkin'
  });
});

// document view
router.get("/document-details/view-document/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/document-view", {
    title: "View document",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'document-details'}),
    action: "view",
    id: req.params.id,
    menu: 'document-details'
  });
});

// document edit
router.get("/quick-checkin/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/quick-checkin", {
    title: "Document update",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'quick-checkin'}),
    action: "edit",
    id: req.params.id,
    menu: 'checkin'
  });
});

// document re-process
router.get("/quick-checkin/re-process/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/quick-checkin", {
    title: "Document reprocess",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'quick-checkin'}),
    action: "re-process",
    id: req.params.id,
    menu: 'checkin'
  });
});

// document add guest
router.get("/quick-checkin/add-guest/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/quick-checkin", {
    title: "Document add guest",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'quick-checkin'}),
    action: "add-guest",
    id: req.params.id,
    menu: 'checkin'
  });
});

// profile 
router.get("/profile", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/profile", {
    title: "Profile",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'profile'}),
    action: "profile",
    menu: 'profile'
  });
});

// room
router.get("/room", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/room", {
    title: "Rooms",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room'}),
    menu: 'room'
  });
});

// room create
router.get("/room/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/create-room", {
    title: "Create room",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room'}),
    action: "create",
    id: 0,
    menu: 'room'
  });
});

// room bulk import
router.get("/room/bulk-import", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/create-room", {
    title: "Create room",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room'}),
    action: "create-bulk",
    id: 0,
    menu: 'room'
  });
});

// room edit
router.get("/room/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/create-room", {
    title: "Update room",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room'}),
    action: "edit",
    id: req.params.id,
    menu: 'room'
  });
});

// room change
router.get("/room-change", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/room-change", {
    title: "Room change",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room-change'}),
    action: "create",
    id: 0,
    menu: 'room-change'
  });
});

// room checkout
router.get("/room-checkout", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/room-checkout", {
    title: "Room checkout",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room-checkout'}),
    action: "create",
    id: 0,
    menu: 'room-checkout'
  });
});

// Dashboard
router.get("/dashboard", validatePermission, function (req, res, next) {

  let userDetails = req.session.userDetails;
  res.render("pages/dashboard", {
    title: "Dashboard",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'dashboard'}),
    action: "create",
    id: 0,
    menu: 'dashboard'
  });
});

// Report check in
router.get("/report-checkin", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/report-checkin", {
    title: "Report-check in",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'report-checkin'}),
    action: "create",
    id: 0,
    menu: 'report-checkin'
  });
});

// Report check out
router.get("/report-checkout", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/report-checkout", {
    title: "Report-check out",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'report-checkout'}),
    action: "create",
    id: 0,
    menu: 'report-checkout'
  });
});

// Report in house
router.get("/report-inhouse", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/report-inhouse", {
    title: "Report-in house",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'report-inhouse'}),
    action: "create",
    id: 0,
    menu: 'report-inhouse'
  });
});

// Report monthly
router.get("/report-monthly", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/report-monthly", {
    title: "Report-monthly",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'report-monthly'}),
    action: "create",
    id: 0,
    menu: 'report-monthly'
  });
});

// Report nationality
router.get("/report-nationality", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/report-nationality", {
    title: "Report-nationality",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'report-nationality'}),
    action: "create",
    id: 0,
    menu: 'report-nationality'
  });
});

// Report processed
router.get("/report-processed", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/report-processed", {
    title: "Report-processed",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'report-processed'}),
    action: "create",
    id: 0,
    menu: 'report-processed'
  });
});

// Report room change
router.get("/report-room-change", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/report-room-change", {
    title: "Report-room-change",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'report-room-change'}),
    action: "create",
    id: 0,
    menu: 'report-room-change'
  });
});

// Property
router.get("/property", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;  
  res.render("pages/property", {
    title: "Property details",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'property'}),
    action: "",
    id: 0,
    menu: 'property'
  });  
});

// Property create
router.get("/property/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/property-form", {
    title: "Create property",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'property'}),
    action: "create",
    id: 0,
    menu: 'property'
  });
});

// property edit
router.get("/property/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/property-form", {
    title: "Update property detail",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'property'}),
    action: "edit",
    id: req.params.id,
    menu: 'property'
  });
});

// Property type
router.get("/property-type", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/property-type", {
    title: "Property type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'property-type'}),
    action: "",
    id: 0,
    menu: 'property-type'
  });
});

// Property type create
router.get("/property-type/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/property-type-form", {
    title: "Create property type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'property-type'}),
    action: "create",
    id: 0,
    menu: 'property-type'
  });
});

// edit/update property  type details
router.get("/property-type/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/property-type-form", {
    title: "Update property type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'property-type'}),
    action: "edit",
    id: req.params.id,
    menu: 'property-type'
  });
});

// Room Type 
router.get("/room-type", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/room-type", {
    title: "Room Type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room-type'}),
    action: "",
    id: 0,
    menu: 'room-type'
  });
});

// room type create
router.get("/room-type/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/room-type-form", {
    title: "Create Room Type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room-type'}),
    action: "create",
    id: 0,
    menu: 'room-type'
  });
});

// room type edit
router.get("/room-type/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/room-type-form", {
    title: "Update Room Type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'room-type'}),
    action: "edit",
    id: req.params.id,
    menu: 'room-type'
  });
});

// visit purpose 
router.get("/visit-purpose", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/visit-purpose", {
    title: "visit purpose",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'visit-purpose'}),
    action: "",
    id: 0,
    menu: 'visit-purpose'
  });
});

// visit purpose create
router.get("/visit-purpose/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/visit-purpose-form", {
    title: "Create visit purpose",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'visit-purpose'}),
    action: "create",
    id: 0,
    menu: 'visit-purpose'
  });
});

// edit/update visit purpose details
router.get("/visit-purpose/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/visit-purpose-form", {
    title: "Update visit purpose",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'visit-purpose'}),
    action: "edit",
    id: req.params.id,
    menu: 'visit-purpose'
  });
});

// Visa Type
router.get("/visa-type", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/visa-type", {
    title: "Visa Type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'visa-type'}),
    action: "",
    id: 0,
    menu: 'visa-type'
  });
});

// Visa type create
router.get("/visa-type/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/visa-type-form", {
    title: "Create Visa Type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'visa-type'}),
    action: "create",
    id: 0,
    menu: 'visa-type'
  });
});

// visa type edit
router.get("/visa-type/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/visa-type-form", {
    title: "Update Visa Type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'visa-type'}),
    action: "edit",
    id: req.params.id,
    menu: 'visa-type'
  });
});

// Country
router.get("/country", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/country", {
    title: "Country details",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'country'}),
    action: "",
    id: 0,
    menu: 'country'
  });
});

// country create
router.get("/country/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/country-form", {
    title: "Create country",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'country'}),
    action: "create",
    id: 0,
    menu: 'country'
  });
});

// country edit
router.get("/country/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/country-form", {
    title: "Update country detail",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'country'}),
    action: "edit",
    id: req.params.id,
    menu: 'country'
  });
});

// document type
router.get("/document-type", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/document-type", {
    title: "Document type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'document-type'}),
    action: "",
    id: 0,
    menu: 'document-type'
  });
});

// document type create
router.get("/document-type/create", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/document-type-form", {
    title: "Create document type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'document-type'}),
    action: "create",
    id: 0,
    menu: 'document-type'
  });
});


// document type edit
router.get("/document-type/edit/:id", validatePermission, function (req, res, next) {
  let userDetails = req.session.userDetails;
  res.render("pages/document-type-form", {
    title: "Update document type",
    baseUrl: baseUrl,
    userDetails: userDetails,
    permission:_.filter(userDetails.userPermission,{'page_name':'document-type'}),
    action: "edit",
    id: req.params.id,
    menu: 'document-type'
  });
});

module.exports = router;
