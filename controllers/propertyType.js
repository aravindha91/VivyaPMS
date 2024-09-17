/*
* Author: Jayamurugan
* Descripton: group details
*/

// import the plugins

// user model schema
const propertyTypeModel = require('../models/propertyType');
const responseSend = require ('../config/response');
const {perPage} = require('../config/config');

// export the user controller functions
module.exports = {
    // create group details
    // create user
    create: function (request, res) {
        var bodyParams = request.body;
        bodyParams.userDetails = request.userDetails;
        propertyTypeModel.create(bodyParams, function (err, response) {
          if(response.status == true){
            responseSend.res(res, 200, response.status, response);
          }
          else if(err.code == "ER_DUP_ENTRY"){
            responseSend.res(res, 409, false, { msg: "Property Name Already Exist" });
          }
          else{
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          }

        });
      },
      update: function (request, res) {
        var bodyParams = request.body;
        bodyParams.userDetails = request.userDetails;
        propertyTypeModel.update(request.params.id,bodyParams, function (err, response) {
          // if (err) {
          //   responseSend.res(res, 500, false, { msg: "Internal server error" });
          // } else {
          //   responseSend.res(res, 200, response.status, response);
          // }
          if(response.status == true){
            responseSend.res(res, 200, response.status, response);
          }
          else if(err.code == "ER_DUP_ENTRY"){
            responseSend.res(res, 409, false, { msg: "Property Name Already Exist" });
          }
          else{
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          }
        });
      },
      getAll: function (req, res) {
        let userDetails = req.userDetails;
        let page = req.query.page ? req.query.page : 1;
        let search = req.query.search ? decodeURI(req.query.search):false;
        let noOfRecordsPerPage = parseInt(req.query['total-page']);
        let offset = (page - 1) * noOfRecordsPerPage;
        propertyTypeModel.getAll(
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
        propertyTypeModel.getById(req.params.id, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },
      deleteById: function (req, res) {
        propertyTypeModel.deleteById(req.params.id, function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      },
      getPropertyTypeList: function (req, res) {
        propertyTypeModel.getPropertyTypeList(req,function (err, response) {
          if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
          } else {
            responseSend.res(res, 200, response.status, response);
          }
        });
      }
}
