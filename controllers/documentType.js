/*
* Author: Jayamurugan
* Descripton: document type controller
*/

// import the plugins

//document type model schema
const documentType = require('../models/documentType');
const responseSend = require ('../config/response');
const {perPage} = require('../config/config');

// export the visit purpose controller functions
module.exports = {
    // create visit purpose
    create: function (request, res) {
        var bodyParams = request.body;
        bodyParams.userDetails = request.userDetails;
        documentType.create(bodyParams, function (err, response) {
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
        documentType.update(request.params.id,bodyParams, function (err, response) {
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
        documentType.getAll(
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
        documentType.getById(req.params.id, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },
      deleteById: function (req, res) {
        documentType.deleteById(req.params.id, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      }
}