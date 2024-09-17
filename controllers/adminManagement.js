/*
 * Author: Jayamurugan
 * Descripton: admim management controller
 */

// admin model schema
const adminManagementModel = require("../models/adminManagement");
const responseSend = require("../config/response");
const {perPage} = require('../config/config');

// export the user controller functions
module.exports = {

  // create
  create: function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    adminManagementModel.create(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, true, response);
      }
    });
  },

  // update
  update: function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    adminManagementModel.update(request.params.id,bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },

  // get all
  getAll: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage = perPage;
    let offset = (page - 1) * noOfRecordsPerPage;
    adminManagementModel.getAll(
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

  //get by id
  getById: function (req, res) {
    adminManagementModel.getById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },

  // delete by id
  deleteById: function (req, res) {
    adminManagementModel.deleteById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  }
};
