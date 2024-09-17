/*
 * Author: Jayamurugan
 * Descripton:
 */

// import the plugins

// user model schema
const reportModel = require("../models/report");
const responseSend = require("../config/response");
const {perPage} = require('../config/config');

// export the user controller functions
module.exports = {
 checkIn: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    reportModel.getCheckIn(
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
  checkOut: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    reportModel.getCheckOut(
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
  inHouse: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    reportModel.getInHouse(
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
  monthly: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    reportModel.getMonthly(
      req,
      offset,
      noOfRecordsPerPage,
      search,
      page,
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
  nationality: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    reportModel.getNationality(
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
  processedRecord: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    reportModel.getProcessedRecord(
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
  roomChange: function (req, res) {
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search):false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    reportModel.getRoomChange(
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
  }
};
