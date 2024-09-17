var sql = require('../config/db.js');
var table = require('../config/tables');
var moment = require('moment');
let currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
var constant = require('../config/constant');
module.exports = {
  create: async function (request, result) {
    let adminId = request.userDetails.user_type === constant.USER_TYPE.ADMIN ? request.userDetails.user_id : request.userDetails.admin_id;
    let query = 'INSERT INTO `' + table.documentType + '` (`admin_id`, `name`, `short_name`, `created_by`, `created_at`, `is_active`) VALUES (?, ?, ?, ?, ?, ?)';
   
    try {
      // Check for name uniqueness before inserting
      const checkQuery = 'SELECT COUNT(*) as count FROM `' + table.documentType + '` WHERE `admin_id` = ? AND `name` = ?';
      const checkResult = await sql.query(checkQuery, [adminId, request.name]);
 
      if (checkResult[0].count > 0) {
        // If a record with the same name and admin_id exists, return an error
        result({ status: false, msg: "Document Type already exist" }, null);
      } else {
        // Insert the record if name is unique
        await sql.query(query, [adminId, request.name, request.short_name, request.userDetails.user_id, currentDateTime, request.is_active]);
        result(null, { status: true, msg: "Successfully created" });
      }
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  update: async function (id, request, result) {
    let query =
      "UPDATE `" +
      table.documentType +
      "` SET `name`=?, `short_name`=?, `modified_by`=?,`modified_at`=?,`is_active`=? WHERE `id`=?";
    try {
      let row = await sql.query(query, [
        request.name,
        request.short_name,
        request.userDetails.user_id,
        currentDateTime,
        request.is_active,
        id
      ]);
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
  },
  getAll: async function (offset, noOfRecordsPerPage, search, userDetails, result) {
    let whereSearch = search ? ("AND ( `name` LIKE '%" +
      search +
      "%' ESCAPE '!')") : '';
 
    let query =
      "SELECT * FROM `" +
      table.documentType +
      "` WHERE `admin_id`=? AND `status`=?" + whereSearch;
    try {
      let adminId = userDetails.user_type === constant.USER_TYPE.ADMIN ? userDetails.user_id:userDetails.admin_id;
      let rowCount = await sql.query(query, [adminId, constant.STATUS.LIVE]);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getPageOffsetData(offset, noOfRecordsPerPage, whereSearch, adminId, result),
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getById: async function (id, result) {
    let query = 'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at  FROM `' + table.documentType + '` WHERE `status`=? AND `id`=?';
 
    try {
      let row = await sql.query(query, [constant.STATUS.LIVE, id]);
      result(null, { status: true, data: row[0] });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  deleteById: async function (id, result) {
    let query =
      "UPDATE `" + table.documentType + '` SET `status`=\''+constant.STATUS.DELETED+'\'  WHERE id=?';
    try {
      let row = await sql.query(query, [id]);
 
      result(null, {
        status: row.affectedRows > 0 ? true : false,
        changes: row.changedRows > 0 ? true : false,
        msg:
          row.affectedRows > 0
            ? row.changedRows > 0
              ? "Successfully deleted"
              : "Not deleted, try again"
            : "Update failed, try again",
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }
}
async function getPageOffsetData(offset, noOfRecordsPerPage, whereSearch, adminId, result) {
  let query = 'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at  FROM `' + table.documentType + '` WHERE `admin_id`=? AND `status`=? ' + whereSearch + 'ORDER BY `name` ASC LIMIT ?,?';
  try {
    let res = await sql.query(query, [adminId, constant.STATUS.LIVE, offset, noOfRecordsPerPage]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}