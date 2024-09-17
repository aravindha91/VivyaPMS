var sql = require('../config/db.js');
var table = require('../config/tables');
var moment = require('moment');
let currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
var constant = require('../config/constant');

module.exports = {
  create: async function (request, result) {
    let query = 'INSERT INTO `' + table.property + '` (`admin_id`,`property_type_id`,`name`,`contact_number`,`website`,`mobile_number`,`manager_name`,`registration_id`,`po_box`,`email`,`address`,`city`,`state`,`pin`,`created_by`,`created_at`,`logo`,`is_active`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    try {
      let adminId = constant.USER_TYPE.ADMIN ===request.userDetails.user_type ? request.userDetails.user_id:request.userDetails.admin_id;
      await sql.query(query, [adminId, request.propertyType, request.name, request.contactNumber, request.website, request.mobileNumber, request.managerName, request.registrationId, request.poBox, request.email, request.address, request.city, request.state, request.pin, request.userDetails.user_id, currentDateTime,request.propertyLogo,request.is_active]);
      result(null, { status: true, msg: "successfully created" });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  update: async function (id, request, result) {
    let extendQuery = '';
    if(request.propertyLogo !==""){
      extendQuery = ' ,`logo`=\''+request.propertyLogo+'\'';
    }
    let query =
      "UPDATE `" +
      table.property +
      "` SET `property_type_id`=?,`name`=?,`contact_number`=?,`website`=?,`mobile_number`=?,`manager_name`=?,`registration_id`=?,`po_box`=?,`email`=?,`address`=?,`city`=?,`state`=?,`pin`=?,`modified_by`=?,`modified_at`=?,`is_active`=? "+extendQuery+" WHERE `property_id`=?";
    try {
      let row = await sql.query(query, [
        request.propertyType, request.name, request.contactNumber, request.website, request.mobileNumber, request.managerName, request.registrationId, request.poBox, request.email, request.address, request.city, request.state, request.pin,
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
    noOfRecordsPerPage = parseInt(noOfRecordsPerPage);
    let whereSearch = search ? ("AND ( `p`.`name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  `pt`.`name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  `p`.`contact_number` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`website` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`mobile_number` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`manager_name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`registration_id` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`po_box` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`email` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`address` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`city` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`state` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `p`.`pin` LIKE '%" +
      search +
      "%' ESCAPE '!')") : '';

    let query =
      "SELECT `p`.* FROM `" +
      table.property +
      "` as `p` left join "+table.propertyType+"  as `pt` on `p`.`property_type_id`=`pt`.`property_type_id` WHERE `p`.`admin_id`=? AND `p`.`status`=?" + whereSearch;
    try {
      let adminId = constant.USER_TYPE.ADMIN ===userDetails.user_type ? userDetails.user_id:userDetails.admin_id;
      let rowCount = await sql.query(query, [userDetails.user_id, constant.STATUS.LIVE]);
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
    let query = 'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at  FROM `' + table.property + '` WHERE `status`=? AND `property_id`=?';

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
      "UPDATE `" + table.property + '` SET `status`=\''+constant.STATUS.DELETED+'\'  WHERE property_id=?';
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
  }, getPropertyList: async function (req, result) {
    let query = 'SELECT `property_id`,`name` FROM `' + table.property + '` WHERE `admin_id`=? AND `status`=? ORDER BY `name` ASC';
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
  }, getPropertyDetails: async function (req, result) {
    let adminId = constant.USER_TYPE.ADMIN ===req.userDetails.user_type ? req.userDetails.user_id:req.userDetails.admin_id;
    let where = req.userDetails.user_type===constant.USER_TYPE.USER?' `p`.`property_id`='+req.userDetails.property_id :' `p`.`admin_id`='+adminId;

    let query = 'SELECT `p`.`property_id`,`pt`.`name` as property_name,`p`.`name`,`p`.`contact_number`,`p`.`website`,`p`.`mobile_number`,`p`.`manager_name`,`p`.`registration_id`,`p`.`po_box`,`p`.`email`,`p`.`address`,`p`.`city`,`p`.`state`,`p`.`pin` FROM `' + table.property + '` as `p` LEFT JOIN '+ table.propertyType+' as `pt` ON `p`.`property_type_id`=`pt`.`property_type_id` WHERE '+where+' AND `p`.`status`=\''+constant.STATUS.LIVE+'\' ORDER BY `p`.`name` ASC';
    try {
      let res = await sql.query(query, []);
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
  let query = 'SELECT `p`.*,DATE_FORMAT(`p`.`created_at`,"%d-%m-%Y") as created_at,`pt`.`name` as property_type_name  FROM `' + table.property + '` as `p` left join '+table.propertyType+' as `pt` on `p`.`property_type_id`=`pt`.`property_type_id` WHERE `p`.`admin_id`=? AND `p`.`status`=? ' + whereSearch + 'ORDER BY `p`.`property_id` DESC LIMIT ?,?';
  try {
    let res = await sql.query(query, [userId, constant.STATUS.LIVE, offset, noOfRecordsPerPage]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}