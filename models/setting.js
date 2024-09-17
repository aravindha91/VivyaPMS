var sql = require("../config/db.js");
var table = require("../config/tables");
var moment = require("moment");
let currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
var constant = require('../config/constant');
module.exports = {
  
  update: async function (request, result) {
  
     let query =
        "UPDATE `" +
        table.setting +
        "` SET `meta_value`=? WHERE `meta_key`=?";
      params = [request.url,
      'destination_url'
      ];
    
    try {
      let row = await sql.query(query, params);
      result(null, {
        status: row.affectedRows > 0 ? true : false,
        changes: row.changedRows > 0 ? true : false,
        msg:
          row.affectedRows > 0
            ? row.changedRows > 0
              ? "Successfully updated"
              : "No changes updated details, try again"
            : "Update failed, try again",
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },getSetting: async function (result) {
  
     let query =
        "SELECT * FROM " +
        table.setting;
      params = [];
    
    try {
      let res= await sql.query(query, params);
      result(null, { status: true, data: res.length ? res : [] });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }
};