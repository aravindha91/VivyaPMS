var sql = require("../config/db.js");
var table = require("../config/tables");
var constant = require('../config/constant');
var defaultData = require('../config/data');
var moment = require("moment");
let currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
var md5 = require("md5");

module.exports = {
  create: async function (request, result) {
    let endDate;
    switch (request.validOption) {
      case "custom":
        endDate = moment(request.endDate, "DD-MM-YYYY").format('YYYY-MM-DD');
        break;
      case "quarterly":
        endDate = moment().add(89, 'days').format('YYYY-MM-DD');
        break;
      case "half-yearly":
        endDate = moment().add(182, 'days').format('YYYY-MM-DD');
        break;
      case "yearly":
        endDate = endDate = moment().add(364, 'days').format('YYYY-MM-DD');;
        break;
    }

    let query =
      "INSERT INTO `" +
      table.users +
      "` (`user_type`,`email`,`first_name`,`last_name`,`password`,`is_active`,`phone`,`created_by`,`created_at`,`user_limit`,`valid_option`,`end_date`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
    // await sql.query("START TRANSACTION");
    try {
      let queryRes = await sql.query(query, [
        "admin",
        request.email,
        request.firstName,
        request.lastName,
        md5(request.password),
        request.isActive,
        request.phone,
        request.userDetails.user_id,
        currentDateTime,
        request.userLimit,
        request.validOption,
        endDate,
      ]);
      let userId = queryRes.insertId;
      await createPermission(userId, result);
      await createDefaultMasterRecord(userId, result);
      // await sql.query("COMMIT");
      result(null, { status: true, msg: "successfully created" });
    } catch (error) {
      console.log(error);
      // await sql.query("ROLLBACK");
      result(error, null);
    }
  },
  update: async function (id, request, result) {
    let endDate;
    switch (request.validOption) {
      case "custom":
        endDate = moment(request.endDate, "DD-MM-YYYY").format('YYYY-MM-DD');
        break;
      case "quarterly":
        endDate = moment().add(89, 'days').format('YYYY-MM-DD');
        break;
      case "half-yearly":
        endDate = moment().add(182, 'days').format('YYYY-MM-DD');
        break;
      case "yearly":
        endDate = endDate = moment().add(364, 'days').format('YYYY-MM-DD');;
        break;
    }
    let password_exist = await checkPassword(id, request.password);
    
    let query =
      "UPDATE `" +
      table.users +
      "` SET `email`=?,`first_name`=?,`last_name`=?,`password`=?,`is_active`=?,`phone`=?,`modified_by`=?,`modified_at`=?,`user_limit`=?, `valid_option`=?,`end_date`=? WHERE `user_id`=?";
    try {
      let row = await sql.query(query, [
        request.email,
        request.firstName,
        request.lastName,
        password_exist ? request.password: md5(request.password),
        request.isActive,
        request.phone,
        request.userDetails.user_id,
        currentDateTime,
        request.userLimit,
        request.validOption,
        endDate,
        id,
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
  getAll: async function (offset, noOfRecordsPerPage, search, result) {
    let whereSearch = search
      ? "AND ( `first_name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  `last_name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  `phone` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `email` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `end_date` LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";
    let query =
      "SELECT * FROM `" +
      table.users +
      "` WHERE `user_type`=? AND `status`=\"" + constant.STATUS.LIVE + "\" " +
      whereSearch;
    try {
      let rowCount = await sql.query(query, ["admin"]);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getPageOffsetData(
          offset,
          noOfRecordsPerPage,
          whereSearch,
          result
        ),
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getById: async function (id, result) {
    let query =
      'SELECT `password`,`user_id`,`phone`,`user_limit`,`email_verified`,`first_name`,`last_name`,`email`,`is_active`,`activated_date`,ifnull(date_format(`last_login_date`,"%d-%m-%Y"),"N/A") as last_login_date,ifnull(date_format(`last_logout_date`,"%d-%m-%Y"),"N/A") as last_logout_date,ifnull(date_format(`created_at`,"%d-%m-%Y"),"N/A") as created_at, `is_active`,ifnull(date_format(end_date,"%d-%m-%Y"),"") as end_date,valid_option FROM `' +
      table.users +
      "` WHERE user_id=? AND `user_type`=?";

    try {
      let row = await sql.query(query, [id, "admin"]);
      result(null, { status: true, data: row[0] });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  deleteById: async function (id, result) {
    let query =
      "UPDATE `" + table.users + '` SET `status`=\'' + constant.STATUS.DELETED + '\'  WHERE user_id=?';
    try {
      let row = await sql.query(query, [id]);
      console.log(row);
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
  },
};
async function getPageOffsetData(
  offset,
  noOfRecordsPerPage,
  whereSearch,
  result
) {
  let query =
    'SELECT `user_id`,`phone`,`user_limit`,`email_verified`,`first_name`,`last_name`,`email`,`is_active`,`activated_date`,ifnull(date_format(`last_login_date`,"%d-%m-%Y"),"N/A") as last_login_date,ifnull(date_format(`last_logout_date`,"%d-%m-%Y"),"N/A") as last_logout_date,ifnull(date_format(`created_at`,"%d-%m-%Y"),"N/A") as created_at, `is_active`,ifnull(date_format(end_date,"%d-%m-%Y"),"") as end_date,valid_option FROM `' +
    table.users +
    "` WHERE `user_type`=? AND `status`=\"" + constant.STATUS.LIVE + "\" " +
    whereSearch +
    " ORDER BY `user_id` DESC LIMIT ?,?";
  try {
    let res = await sql.query(query, ["admin", offset, noOfRecordsPerPage]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function createPermission(userId, result) {
  let values = 'VALUES(\'' + userId + '\',\'user\',\'Y\',\'Y\',\'Y\',\'Y\')';
  let pageNames = ['quick-checkin', 'document-details', 'profile', 'room', 'room-change', 'dashboard', 'report-checkin', 'report-checkout', 'report-inhouse', 'report-monthly', 'report-nationality', 'report-processed', 'report-room-change', 'property', 'property-type', 'room-type', 'visit-purpose', 'visa-type', 'country', 'document-type'];
  pageNames.forEach(row => {
    values += `,(${userId},'${row}','Y','Y','Y','Y')`;
  });

  let query = 'INSERT INTO ' + table.userPermission + '(`user_id`,`page_name`,`view`,`create`,`edit`,`delete`)' + values;

  try {
    let res = await sql.query(query, [userId]);
    return res.insertId;
  } catch (error) {
    console.log(error);
    // await sql.query("ROLLBACK");
    result(error, null);
  }
}
async function createDefaultMasterRecord(userId, result) {
  await createCountry(userId, result);
  await createVisaType(userId, result);
  await createPurposeVisit(userId, result);
  await createDocumentType(userId, result);
  return true;
}
async function createCountry(userId, result) {
  let values = '';
  let i = 0;
  for await (let country of defaultData.country) {
    values += i === 0 ? ` VALUES(${userId},"${country.short_name}","${country.short_name_two}","${country.name}",0)` : `,(${userId},"${country.short_name}","${country.short_name_two}","${country.name}",0)`;
    i++;
  }

  let query = 'INSERT INTO ' + table.country + '(`admin_id`,`short_name`,`short_name_two`,`name`,`country_id`)' + values;

  try {
    let res = await sql.query(query, []);
    return res.insertId;
  } catch (error) {
    console.log(error);
    // await sql.query("ROLLBACK");
    result(error, null);
  }
}
async function createVisaType(userId, result) {
  let values = '';
  let i = 0;
  for await (let visaType of defaultData.visa_types) {
    values += i === 0 ? ` VALUES(${userId},"${visaType.value}","${visaType.text}",${visaType.visa_id})` : `,(${userId},"${visaType.value}","${visaType.text}",${visaType.visa_id})`;
    i++;
  }
 
  let query = 'INSERT INTO ' + table.visaType + '(`admin_id`,`short_name`,`name`,`visa_id`)' + values;
 
  try {
    let res = await sql.query(query, []);
    return res.insertId;
  } catch (error) {
    console.log(error);
    // await sql.query("ROLLBACK");
    result(error, null);
  }
}
async function createPurposeVisit(userId, result) {
  let values = '';
  let i = 0;
  for await (let pv of defaultData.purpost_to_visit) {
    values += i === 0 ? ` VALUES(${userId},"${pv.value}","${pv.text}")` : `,(${userId},"${pv.value}","${pv.text}")`;
    i++;
  }

  let query = 'INSERT INTO ' + table.purposeToVisit + '(`admin_id`,`visit_id`,`name`)' + values;

  try {
    let res = await sql.query(query, []);
    return res.insertId;
  } catch (error) {
    console.log(error);
    // await sql.query("ROLLBACK");
    result(error, null);
  }
}
async function createDocumentType(userId, result) {
  let values = '';
  let i = 0;
  for await (let dt of defaultData.document_types) {
    values += i === 0 ? ` VALUES(${userId}, "${dt.name}", "${dt.short_name}")` : `,(${userId}, "${dt.name}", "${dt.short_name}")`;
    i++;
  }
 
  let query = 'INSERT INTO ' + table.documentType + '(`admin_id`, `name`, `short_name`)' + values;
 
  try {
    let res = await sql.query(query, []);
    return res.insertId;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}


async function checkPassword(userId, password) {
  let query =
    "SELECT password FROM `" +
    table.users +
    "` WHERE `user_id`=? and `password`=?";

  try {
    let res = await sql.query(query, [userId, password]);
    return res.length ? true : false;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}