/*
* Author: Jayamurugan
* Descripton: country controller
*/

// import the plugins

// country model schema
const countryModel = require('../models/country');
const responseSend = require ('../config/response');
const {perPage} = require('../config/config');

// export the country controller functions
module.exports = {
    // create
    create: function (request, res) {
        var bodyParams = request.body;
        bodyParams.userDetails = request.userDetails;
        countryModel.create(bodyParams, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },

      // update
      update: function (request, res) {
        var bodyParams = request.body;
        bodyParams.userDetails = request.userDetails;
        countryModel.update(request.params.id,bodyParams, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },

      // get all
      getAll: function (req, res) {
        let userDetails = req.userDetails;
        let page = req.query.page ? req.query.page : 1;
        let search = req.query.search ? decodeURI(req.query.search):false;
        let noOfRecordsPerPage = parseInt(req.query['total-page']);
        let offset = (page - 1) * noOfRecordsPerPage;
        countryModel.getAll(
          offset,
          noOfRecordsPerPage,
          search,
          userDetails,
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

      // get by id
      getById: function (req, res) {
        countryModel.getById(req.params.id, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },

      // delete by id
      deleteById: function (req, res) {
        countryModel.deleteById(req.params.id, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      }
}
