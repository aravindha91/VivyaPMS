/*
 * Author: Jayamurugan
 * Descripton: password details
 */

// import the plugins

// user model schema
const settingModel = require("../models/setting");
const responseSend = require("../config/response");

// export the user controller functions
module.exports = {
  update: function (request, res) {
    var bodyParams = request.body;
    settingModel.update(
      bodyParams,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },getSetting: function (request, res) {
    settingModel.getSetting(function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  }
};