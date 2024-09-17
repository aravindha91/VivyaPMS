var sql = require('../config/db.js');
var table = require('../config/tables');
var moment = require('moment');
let currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
var constant = require('../config/constant');
module.exports = {
  create: async function (request, result) {
    let query = 'INSERT INTO `' + table.roomType + '` (`admin_id`,`name`,`created_by`,`created_at`,`is_active`) VALUES(?,?,?,?,?)';
    try {
      let adminId = constant.USER_TYPE.ADMIN ===request.userDetails.user_type ? request.userDetails.user_id:request.userDetails.admin_id;
      await sql.query(query, [adminId, request.name,request.userDetails.user_id, currentDateTime,request.is_active]);
      result(null, { status: true, msg: "successfully created" });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  update: async function (id, request, result) {
    let query =
      "UPDATE `" +
      table.roomType +
      "` SET `name`=?,`modified_by`=?,`modified_at`=?,`is_active`=? WHERE `room_type_id`=?";
    try {
      let row = await sql.query(query, [
        request.name,
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
      table.roomType +
      "` WHERE `admin_id`=? AND `status`=?" + whereSearch;
    try {
      let adminId = constant.USER_TYPE.ADMIN ===userDetails.user_type ? userDetails.user_id:userDetails.admin_id;
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
    let query = 'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at  FROM `' + table.roomType + '` WHERE `status`=? AND `room_type_id`=?';

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
      "UPDATE `" + table.roomType + '` SET `status`=\''+constant.STATUS.DELETED+'\'  WHERE room_type_id=?';
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
  }, getroomTypeList: async function (req, result) {
    let query = 'SELECT `room_type_id`,`name` FROM `' + table.roomType + '` WHERE `admin_id`=? AND `status`=? ORDER BY `name` ASC';
    try {
      let adminId = constant.USER_TYPE.ADMIN ===req.userDetails.user_type ? req.userDetails.user_id:req.userDetails.admin_id;
      let res = await sql.query(query, [adminId, constant.STATUS.LIVE]);
      result(null, {
        status: true,
        data: res.length ? res : []
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }
}
async function getPageOffsetData(offset, noOfRecordsPerPage, whereSearch, userId, result) {
  let query = 'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at  FROM `' + table.roomType + '` WHERE `admin_id`=? AND `status`=? ' + whereSearch + 'ORDER BY `room_type_id` DESC LIMIT ?,?';
  try {
    let res = await sql.query(query, [userId, constant.STATUS.LIVE, offset, noOfRecordsPerPage]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}