/*
 * Author: Jayamurugan
 * Descripton:
 */

// import the plugins

// user model schema
const roomModel = require("../models/room");
const responseSend = require("../config/response");
const { perPage } = require('../config/config');
const readXlsxFile = require('read-excel-file/node')
const path = require('path');
const constant = require("../config/constant");

// export the user controller functions
module.exports = {
  // create user
  create: function (request, res) {
    var bodyParams = request.body;
    bodyParams.isActive = bodyParams.is_active;
    bodyParams.userDetails = request.userDetails;
    roomModel.create(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  // bulk import
  bulkImport: async function (req, res) {
    var bodyParams = req.body;
    bodyParams.isActive = bodyParams['is-active'];
    bodyParams.userDetails = req.userDetails;

    let scanDocument;
    let uploadPath;

    let fileName;
    let baseName;

    let dir = `./uploads/`;

    excelFile = req.files["import-file"];

    let _ext = path.extname(excelFile.name).substr(1);
    baseName = "import_" + Math.floor(Math.random() * 1000000000) + Date.now();
    fileName = baseName + "." + _ext;
    uploadPath = dir + fileName;

    // Use the mv() method to place the file somewhere on your server
    await excelFile.mv(uploadPath, async function (err) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
        return;
      }
      // File path
      let excelData = await readXlsxFile(uploadPath);
      let finalData = [];
      for await (let row of excelData) {
        finalData.push(row[0]);
      }
      bodyParams.rooms = finalData.join(',');
      roomModel.create(bodyParams, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      });

    });
  },

  update: function (request, res) {
    var bodyParams = request.body;
    bodyParams.isActive = bodyParams.is_active;
    bodyParams.userDetails = request.userDetails;
    roomModel.update(
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
    let search = req.query.search ? decodeURI(req.query.search) : false;
    let noOfRecordsPerPage = parseInt(req.query['total-page']);
    let offset = (page - 1) * noOfRecordsPerPage;
    roomModel.getAll(
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
    roomModel.getById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  }, getRoomCounts: function (req, res) {
    let propertyId =req.userDetails.user_type ===constant.USER_TYPE.ADMIN ? req.query.property_id:req.userDetails.property_id;
    roomModel.getRoomCounts(req.userDetails,propertyId, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  }, getPropertyList: function (req, res) {
    roomModel.getPropertyList(req.userDetails, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  deleteById: function (req, res) {
    roomModel.deleteById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  }, getRoomList: async function (req, res) {
    let userDetails = req.userDetails;
    roomModel.getRoomList(
      userDetails,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  }, getCheckInList: async function (req, res) {
    let userDetails = req.userDetails;
    roomModel.getCheckInList(
      userDetails,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  }, getOccupiedRoomList: async function (req, res) {
    let userDetails = req.userDetails;
    roomModel.getOccupiedRoomList(
      userDetails,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  }, getAvailableRoomList: async function (req, res) {
    let userDetails = req.userDetails;
    roomModel.getAvailableRoomList(
      userDetails,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  getDocumentDetailsById: async function (req, res) {
    roomModel.getDocumentDetailsById(
      req.params.id,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  getDocumentDetailsRoomById: async function (req, res) {
    roomModel.getDocumentDetailsRoomById(
      req.params.id,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  changeRooms: function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    roomModel.changeRooms(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  }, validateRoom: async function (req, res) {
    roomModel.validateRoom(
      req.params.id,
      req.body,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  }, getSecondaryUsers: async function (req, res) {
    roomModel.getSecondaryUsers(
      req.params.id,
      req.body,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  updateCheckout: function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    roomModel.updateCheckout(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  }
};
