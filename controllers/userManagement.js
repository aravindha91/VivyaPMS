/*
 * Author: Jayamurugan
 * Descripton:
 */

// import the plugins

// user model schema
const userManagementModel = require("../models/userManagement");
const responseSend = require("../config/response");
const {perPage} = require('../config/config');

// export the user controller functions
module.exports = {
  // user login
  login: function (request, res) {
    userManagementModel.login(request,res, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  // create user
  create: function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    userManagementModel.create(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  // validate email
  validateEmail: function (request, res) {
    var bodyParams = request.body;
    
    userManagementModel.validateEmail(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  update: function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    userManagementModel.update(
      request.params.id,
      bodyParams,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  updateProfile: function (request, res) {
    var bodyParams = request.body;
    userManagementModel.updateProfile(
      request.params.id,
      bodyParams,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  getAll: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage =parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    userManagementModel.getAll(
      req,
      offset,
      noOfRecordsPerPage,
      search,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          response.page = page;
          response.offset = offset;
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  getById: function (req, res) {
    userManagementModel.getById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  deleteById: function (req, res) {
    userManagementModel.deleteById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
};
