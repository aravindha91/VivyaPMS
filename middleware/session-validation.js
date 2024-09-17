var userModel = require('../models/userManagement');
var _ = require('lodash');
var dotenv = require("dotenv");
dotenv.config();

var baseUrl = process.env.BASE_URL;

module.exports = {
  validate: function (req, res, next) {
    let userDetails = req.session.userDetails;
    if (typeof userDetails === 'undefined') {

      res.redirect(baseUrl);
    } else if (userDetails.user_type !== 'super-admin') {
      res.redirect(baseUrl);
    } else {
      next();
    }
  },
  validateAdmin: function (req, res, next) {
    let userDetails = req.session.userDetails;
    if (typeof userDetails === 'undefined') {

      res.redirect(baseUrl);
    } else if (userDetails.user_type !== 'admin') {
      res.redirect(baseUrl);
    } else {
      next();
    }
  },
  validateUser: function (req, res, next) {
    let userDetails = req.session.userDetails;
    if (typeof userDetails === 'undefined') {

      res.redirect(baseUrl);
    } else if (userDetails.user_type !== 'user') {
      res.redirect(baseUrl);
    } else {
      next();
    }
  }, validateSession: function (req, res, next) {
    let userDetails = req.session.userDetails;
    if (typeof userDetails === 'undefined') {

      res.redirect(baseUrl);
    } else {
      next();
    }
  }, validatePermission: async function (req, res, next) {
    let userDetails = req.session.userDetails;
    if (typeof userDetails === 'undefined') {
      res.redirect(baseUrl);
      return;
    }
    let explodeUrl = req.originalUrl.split('/');
    
    let removedEmptyString=explodeUrl.filter(ele => ele !="");
    
    let result = await userModel.validatePermission(removedEmptyString[0].split("?")[0], userDetails.user_id);
    if (result === true) {
      next();
    } else {
      res.render("pages/error-404", { title: "Page not found", baseUrl: baseUrl });
    }
  }
}