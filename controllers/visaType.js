/*
* Author: Jayamurugan
* Descripton: group details
*/

// import the plugins

// visa type model schema
const visaTypeModel = require('../models/visaType');
const responseSend = require ('../config/response');
const {perPage} = require('../config/config');

// export the visa type controller functions
module.exports = {
    // create group details
    // create visa type
    create: function (request, res) {
        var bodyParams = request.body;
        bodyParams.userDetails = request.userDetails;
        visaTypeModel.create(bodyParams, function (err, response) {
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
        visaTypeModel.update(request.params.id,bodyParams, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },
      getAll: function (req, res) {
        let userDetails = req.userDetails;
        let page = req.query.page ? req.query.page : 1;
        let search = req.query.search ? decodeURI(req.query.search):false;
        let noOfRecordsPerPage = parseInt(req.query['total-page']);
        let offset = (page - 1) * noOfRecordsPerPage;
        visaTypeModel.getAll(
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
      getById: function (req, res) {
        visaTypeModel.getById(req.params.id, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },
      deleteById: function (req, res) {
        visaTypeModel.deleteById(req.params.id, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },
      getvisaTypeList: function (req, res) {
        visaTypeModel.getvisaTypeList(req,function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      }
}