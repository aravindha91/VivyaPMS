var sql = require('../config/db.js');
var table = require('../config/tables');
var moment = require('moment');
let currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
var constant = require('../config/constant');
module.exports = {
  create: async function (request, result) {
    let adminId = request.userDetails.user_type === constant.USER_TYPE.ADMIN ? request.userDetails.user_id:request.userDetails.admin_id;
    let query = 'INSERT INTO `' + table.purposeToVisit + '` (`admin_id`,`visit_id`,`name`,`created_by`,`created_at`) VALUES(?,?,?,?,?)';
    try {
      await sql.query(query, [adminId, request.visitId,request.name,request.userDetails.user_id, currentDateTime]);
      result(null, { status: true, msg: "successfully created" });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  update: async function (id, request, result) {
    let query =
      "UPDATE `" +
      table.purposeToVisit +
      "` SET `is_active`=?, `name`=?,`visit_id`=?,`modified_by`=?,`modified_at`=? WHERE `id`=?";
    try {
      let row = await sql.query(query, [
        request.is_active,
        request.name,
        request.visitId,
        request.userDetails.user_id,
        currentDateTime,
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
      table.purposeToVisit +
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
    let query = 'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at  FROM `' + table.purposeToVisit + '` WHERE `status`=? AND `id`=?';

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
      "UPDATE `" + table.purposeToVisit + '` SET `status`=\''+constant.STATUS.DELETED+'\'  WHERE id=?';
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
  let query = 'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at  FROM `' + table.purposeToVisit + '` WHERE `admin_id`=? AND `status`=? ' + whereSearch + 'ORDER BY `name` ASC LIMIT ?,?';
  try {
    let res = await sql.query(query, [adminId, constant.STATUS.LIVE, offset, noOfRecordsPerPage]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}