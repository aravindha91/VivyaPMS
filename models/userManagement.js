var sql = require("../config/db.js");
var table = require("../config/tables");
var moment = require("moment");
let currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
const jwt = require("jsonwebtoken");
var constant = require('../config/constant');
var md5 = require("md5");
module.exports = {
  login: async function (request, resSend, result) {
    let query =
      "SELECT * FROM `" +
      table.users +
      "` WHERE `email`=? AND `password`=? AND `is_active`=? AND `status`=?";
    try {
      let row = await sql.query(query, [
        request.body.username,
        md5(request.body.password),
        constant.STATUS.YES,
        constant.STATUS.LIVE,
      ]);

      if (row.length) {
        let redirectTo = "";
        switch (row[0].user_type) {
          case constant.USER_TYPE.SUPER_ADMIN:
            redirectTo = "S";
            break;
          case constant.USER_TYPE.ADMIN:
            redirectTo = "A";
            break;
          case constant.USER_TYPE.USER:
            redirectTo = "U";
            break;
        }

        if (row[0].user_type === constant.USER_TYPE.USER || row[0].user_type === constant.USER_TYPE.ADMIN) {
          let userId =
            row[0].user_type === constant.USER_TYPE.USER ? row[0].admin_id : row[0].user_id;
          await validateLicenseEndDate(userId, result);
        }
        // Create a token
        const payload = { userDetails: row[0] };
        const options = { algorithm: "HS256" };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, options);
       // console.log("333333333333",{token})
        row[0].token = token;
        row[0].userPermission = await getUserPermission(row[0].user_id, result);

        request.session.userDetails = row[0];

        result(null, { status: true, ac: redirectTo, token: token });
      } else {
        result(null, {
          status: false,
          msg: "Login failed, please check username and password",
        });
      }
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  validateEmail: async function (request, result) {
    let query =
      "SELECT * FROM `" + table.users + "` WHERE `email`=? AND `status`=?";
    try {
      let row = await sql.query(query, [request.email, constant.STATUS.LIVE]);
      if (row.length) {
        result(null, { status: true, msg: "Email exist" });
      } else {
        result(null, {
          status: false,
          msg: "Email not exist",
        });
      }
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  create: async function (request, result) {
    let userLimit = await getUserLimit(request.userDetails.user_id);
    let userCount = await getUserCount(request.userDetails.user_id);
    
    if (userCount >= userLimit) {
      result(null, { status: false, msg: "User limit exist" });
      return;
    }
    let query =
      "INSERT INTO `" +
      table.users +
      "` (`user_type`,`email`,`first_name`,`last_name`,`password`,`is_active`,`property_id`,`admin_id`,`phone`,`created_by`,`created_at`) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
    // await sql.query("START TRANSACTION");
    try {
      let queryRes = await sql.query(query, [
        constant.USER_TYPE.USER,
        request.email,
        request.firstName,
        request.lastName,
        md5(request.password),
        request.isActive,
        request.property,
        request.userDetails.user_id,
        request.phone,
        request.userDetails.user_id,
        currentDateTime,
      ]);
      let userId = queryRes.insertId;
      await createUserPermission(userId, request.userPermission, result);
      // await sql.query("COMMIT");
      result(null, { status: true, msg: "successfully created" });
    } catch (error) {
      console.log(error);
      // await sql.query("ROLLBACK");
      result(error, null);
    }
  },
  update: async function (userId, request, result) {
    let password_exist = await checkPassword(userId,request.password);
    let query =
      "UPDATE `" +
      table.users +
      "` SET `email`=?,`first_name`=?,`last_name`=?,`is_active`=?,`property_id`=?,password=?,`phone`=?,`modified_by`=?,`modified_at`=? WHERE `user_id`=?";

    // await sql.query("START TRANSACTION");

    try {
      let row = await sql.query(query, [
        request.email,
        request.firstName,
        request.lastName,
        request.isActive,
        request.property,
        password_exist ? request.password: md5(request.password),
        request.phone,
        request.userDetails.user_id,
        currentDateTime,
        userId,
      ]);
      await deleteUserPermission(userId, result);
      await createUserPermission(userId, request.userPermission, result);
      // await sql.query("COMMIT");
      result(null, {
        status: row.affectedRows > 0 ? true : false,
        changes: row.changedRows > 0 ? true : false,
        msg:
          row.affectedRows > 0
            ?  "Successfully updated"
            : "Update failed, try again",
      });
    } catch (error) {
      console.log(error);
      // await sql.query("ROLLBACK");
      result(error, null);
    }
  },
  updateProfile: async function (id, request, result) {
    let password_exist = await checkPassword(id,request.password);
    let query =
      "UPDATE `" +
      table.users +
      "` SET `email`=?,`first_name`=?,`last_name`=?,password=?,`phone`=?,`modified_by`=?,`modified_at`=? WHERE `user_id`=?";
    try {
      let row = await sql.query(query, [
        request.email,
        request.firstName,
        request.lastName,
        password_exist ? request.password: md5(request.password),
        request.phone,
        request.id,
        currentDateTime,
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
  getAll: async function (request, offset, noOfRecordsPerPage, search, result) {
    let whereSearch = search
      ? "AND ( u.`first_name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  u.`last_name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  u.`phone` LIKE '%" +
      search +
      "%' ESCAPE '!' OR u.`email` LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";

    let query =
      "SELECT * FROM `" +
      table.users +
      "` as u WHERE u.`user_type`=? AND u.`admin_id`=? AND u.`status`=?" +
      whereSearch;
      let adminId = constant.USER_TYPE.ADMIN ===request.userDetails.user_type ? request.userDetails.user_id:request.userDetails.admin_id;

    try {
      let rowCount = await sql.query(query, [
        constant.USER_TYPE.USER,
        adminId,
        constant.STATUS.LIVE,
      ]);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getPageOffsetData(
          offset,
          noOfRecordsPerPage,
          adminId,
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
      'SELECT `u`.`property_id`,`u`.`phone`,`u`.`password`,`u`.`user_id`,`u`.`user_limit`,`u`.`email_verified`,`u`.`first_name`,`u`.`last_name`,`u`.`email`,`u`.`is_active`,`u`.`activated_date`,ifnull(date_format(`u`.`last_login_date`,"%d-%m-%Y"),"N/A") as last_login_date,ifnull(date_format(`u`.`last_logout_date`,"%d-%m-%Y"),"N/A") as last_logout_date,ifnull(date_format(`u`.`created_at`,"%d-%m-%Y"),"N/A") as created_at, `u`.`is_active`,`pt`.`name` as property_name FROM `' +
      table.users +
      "` AS u left join " +
      table.property +
      " as pt on u.property_id=pt.property_id WHERE u.user_id=?";

    try {
      let row = await sql.query(query, [id]);

      if (row.length) {
        row[0].userPermission = await getUserPermission(row[0].user_id, result);
      }

      result(null, {
        status: row.length > 0 ? true : false,
        data: row.length > 0 ? row[0] : [],
      });
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
  }, validatePermission: async function (pageName, userId) {
    let query =
      "SELECT `view` FROM `" + table.userPermission + '` WHERE page_name=? AND user_id=?';
    try {
      let row = await sql.query(query, [pageName, userId]);
      if (row.length) {
        return row[0].view === constant.STATUS.YES ? true : false;
      } else {
        return false;
      }

    } catch (error) {
      console.log(error);
      return false;
    }
  },
};
async function getPageOffsetData(
  offset,
  noOfRecordsPerPage,
  adminId,
  whereSearch,
  result
) {
  let query =
    'SELECT `u`.`phone`,`u`.`user_id`,`u`.`email_verified`,`u`.`first_name`,`u`.`last_name`,`u`.`email`,`u`.`is_active`,`u`.`activated_date`,ifnull(date_format(`u`.`last_login_date`,"%d-%m-%Y"),"N/A") as last_login_date,ifnull(date_format(`u`.`last_logout_date`,"%d-%m-%Y"),"N/A") as last_logout_date,ifnull(date_format(`u`.`created_at`,"%d-%m-%Y"),"N/A") as created_at, `u`.`is_active`,`pt`.`name` as property_name FROM `' +
    table.users +
    "` as u left join " +
    table.property +
    " as pt on u.property_id=pt.property_id WHERE u.user_type=? AND `u`.`admin_id`=? AND u.`status`=? " +
    whereSearch +
    "  order by user_id desc LIMIT ?,?";
  try {
    let res = await sql.query(query, [
      constant.USER_TYPE.USER,
      adminId,
      constant.STATUS.LIVE,
      offset,
      noOfRecordsPerPage,
    ]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getUserLimit(userId, result) {
  let query = "SELECT user_limit FROM `" + table.users + "` WHERE user_id=?";

  try {
    let res = await sql.query(query, [userId]);
    return res[0].user_limit;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getUserCount(userId, result) {
  let query =
    "SELECT * FROM `" + table.users + "` WHERE `status`=? AND admin_id=?";

  try {
    let res = await sql.query(query, [constant.STATUS.LIVE, userId]);
    return res.length;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function validateLicenseEndDate(id, result) {
  let query =
    "SELECT  date_format(end_date,'%Y-%m-%d') as check_date FROM `" +
    table.users +
    "` WHERE `user_id`=?";

  try {
    let res = await sql.query(query, [id]);
    res[0].check_date;
    if (moment().format("YYYY-MM-DD") > res[0].check_date) {
      result(null, {
        status: false,
        msg: "Your license expired",
      });
      return;
    }
    return true;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getUserPermission(userId, result) {
  let query =
    "SELECT `view`,`create`,`edit`,`delete`,`page_name` FROM `" +
    table.userPermission +
    "` WHERE `user_id`=?";

  try {
    let res = await sql.query(query, [userId]);
    return res ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function createUserPermission(userId, permission, result) {
  let values = '';
  await permission.forEach(async (row, i) => {
    values += i === 0 ? `VALUES(${userId},'${row.slug}','${row.view}','${row.create}','${row.edit}','${row.delete}')` : `,(${userId},'${row.slug}','${row.view}','${row.create}','${row.edit}','${row.delete}')`;
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

async function deleteUserPermission(userId, result) {
  let query = 'DELETE FROM ' + table.userPermission + ' WHERE user_id=?';
  try {
    await sql.query(query, [userId]);
    return true;
  } catch (error) {
    console.log(error);
    // await sql.query("ROLLBACK");
    result(error, null);
  }
}

async function checkPassword(userId, password) {
  let query =
    "SELECT password FROM `" +
    table.users +
    "` WHERE `user_id`=? and `password`=?";

  try {
    let res = await sql.query(query, [userId,password]);
    return res.length ? true : false;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
