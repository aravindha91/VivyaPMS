/*
* Author: Jayamurugan
* Descripton: group details
*/

// import the plugins

// user model schema
const propertyModel = require('../models/property');
const responseSend = require('../config/response');
const { perPage } = require('../config/config');
const path = require('path');
// export the user controller functions
module.exports = {
  // create group details
  // create user
  create: async function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    var _propertyLogo = '';
    if (bodyParams['logo'] !== '') {
      _propertyLogo = await uploadPropertyLogo(request, res);
    }
    bodyParams.propertyLogo = _propertyLogo;

    propertyModel.create(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  update: async function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    var _propertyLogo = '';
    if (bodyParams['logo'] !== '') {
      _propertyLogo = await uploadPropertyLogo(request, res);
    }
    bodyParams.propertyLogo = _propertyLogo;
    propertyModel.update(request.params.id, bodyParams, function (err, response) {
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
    let search = req.query.search ? decodeURI(req.query.search) : false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    propertyModel.getAll(
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
    propertyModel.getById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  deleteById: function (req, res) {
    propertyModel.deleteById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  getPropertyList: function (req, res) {
    propertyModel.getPropertyList(req, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  getPropertyDetails: function (req, res) {
    propertyModel.getPropertyDetails(req, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  }, getUserPropertyById: function (req, res) {
    propertyModel.getById(req.userDetails.property_id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },

}
async function uploadPropertyLogo(req, res) {
  let scanDocument;
  let uploadPath;
  let fileName;
  let baseName;

  let dir = `./uploads/`;

  scanDocument = req.files["logo"];
  let _ext =path.extname(scanDocument.name).substr(1);
  baseName = "property_logo_" + Math.floor(Math.random() * 1000000000) + Date.now();
  fileName = baseName + '.'+_ext;

  uploadPath = dir + fileName;
  fileType = scanDocument.mimetype;

  // Use the mv() method to place the file somewhere on your server
  await scanDocument.mv(uploadPath, function (err) {
    if (err) {
      responseSend.res(res, 500, false, { msg: "Internal server error" });
      return;
    }
  });
  return fileName;
}