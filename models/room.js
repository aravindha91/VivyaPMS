var sql = require("../config/db.js");
var table = require("../config/tables");
var moment = require("moment");
let currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
const jwt = require("jsonwebtoken");
let _ = require('lodash');
var constant = require('../config/constant');

module.exports = {

  create: async function (request, result) {

    let _queryString = '';
    let _rooms = [];
    let _commaValues = (request['rooms']).split(',');

    for (let k = 0; k < _commaValues.length; k++) {
      let _isBetweenNumbers = _commaValues[k].split('-');

      if (_isBetweenNumbers.length > 1) {
        let _startNumber = _isBetweenNumbers[0];
        let _lastNumber = _isBetweenNumbers[1];

        for (let z = _startNumber; z <= _lastNumber; z++) {
          if (z <= _lastNumber) {
            _rooms.push(z);
          }
        }
      } else {
        // single room number push to the array
        _rooms.push(_commaValues[k]);
      }
    }

    let _isFirst = true;
    let adminId = constant.USER_TYPE.ADMIN === request.userDetails.user_type ? request.userDetails.user_id : request.userDetails.admin_id;
    for (let j = 0; j < _rooms.length; j++) {
      let _isExist = await validateRoomExist(_rooms[j], request.property);
      if (!_isExist) {
        _queryString += _isFirst === true ? `VALUES('${adminId}','${_rooms[j]}','${request.userDetails.user_id}','${currentDateTime}','${request.property}','${request.room_type}','${request.isActive}')` : `,('${adminId}','${_rooms[j]}','${request.userDetails.user_id}','${currentDateTime}','${request.property}','${request.room_type}','${request.is_active}')`;
        _isFirst = false;
      }
    }
    let query =
      "INSERT INTO `" +
      table.room +
      "` (`admin_id`,`name`,`created_by`,`created_at`,`property_id`,`room_type_id`,`is_active`) " + _queryString;

    try {
      await sql.query(query, []);
      result(null, { status: true, msg: "successfully created" });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  update: async function (id, request, result) {
    let query =
      "UPDATE `" +
      table.room +
      "` SET `name`=?,`property_id`=?,`modified_by`=?,`modified_at`=?,`room_type_id`=?,`is_active`=? WHERE `room_id`=?";
    try {
      let row = await sql.query(query, [
        request.rooms,
        request.property,
        request.userDetails.user_id,
        currentDateTime,
        request.room_type,
        request.is_active,
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
      ? "AND ( r.`name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR rt.`name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR p.`name` LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";

    let query =
      "SELECT r.*  FROM `" +
      table.room +
      "` as r LEFT JOIN " + table.roomType + " as rt on r.room_type_id=rt.room_type_id left join " + table.property + " as p on r.property_id=p.property_id LEFT JOIN " + table.mapRoomDocument + " as mrd on r.room_id=mrd.room_id AND mrd.check_in_status=\"" + constant.STATUS.ACTIVE + "\" WHERE r.`admin_id`=? AND r.`status`=?" +
      whereSearch;
    try {
      let adminId = constant.USER_TYPE.ADMIN === request.userDetails.user_type ? request.userDetails.user_id : request.userDetails.admin_id;
      let rowCount = await sql.query(query, [
        adminId,
        constant.STATUS.LIVE
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
      'SELECT * FROM `' +
      table.room +
      "` WHERE room_id=?";

    try {
      let row = await sql.query(query, [id]);
      result(null, {
        status: row.length > 0 ? true : false,
        data: row.length > 0 ? row[0] : {},
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  deleteById: async function (id, result) {
    let query =
      "UPDATE `" + table.room + '` SET `status`=\'' + constant.STATUS.DELETED + '\'  WHERE room_id=?';
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
  }, getRoomList: async function (userDetails, result) {
    let adminId = constant.USER_TYPE.ADMIN === userDetails.user_type ? userDetails.user_id : userDetails.admin_id;

    let query =
      "SELECT *,date_format(created_at,'%d-%m-%Y') as created_at  FROM `" +
      table.room +
      "`  WHERE `admin_id`=? AND `status`=?";
    try {
      let res = await sql.query(query, [adminId, constant.STATUS.LIVE]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }, getCheckInList: async function (userDetails, result) {
    let adminId = constant.USER_TYPE.ADMIN === userDetails.user_type ? userDetails.user_id : userDetails.admin_id;
    let propertyId = constant.USER_TYPE.ADMIN === userDetails.user_type ? '' : ' AND r.property_id=\''+userDetails.property_id+'\'';
    let query =
      "SELECT r.*,ifnull(mrd.check_in_status,\'N\') as room_status FROM `" +
      table.room +
      "` as r LEFT JOIN " + table.mapRoomDocument + " as mrd on r.room_id=mrd.room_id AND mrd.check_in_status=\"" + constant.STATUS.ACTIVE + "\" WHERE r.`admin_id`=? AND r.`status`=? "+propertyId+" order by name asc";
    try {
      let res = await sql.query(query, [adminId, constant.STATUS.LIVE]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }, validateRoom: async function (property_id, body, result) {
    let query =
      "SELECT * FROM `" +
      table.room +
      "`  WHERE `property_id`=? AND `status`=? AND `name`=?";
    try {
      let res = await sql.query(query, [property_id, constant.STATUS.LIVE, body.room]);
      result(null, {
        status: res.length ? true : false
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }, getSecondaryUsers: async function (mrdId, body, result) {
    let query =
      "SELECT * FROM `" +
      table.documentDetails +
      "`  WHERE `document_details_id` IN(" + body.users + ")";
    try {
      let res = await sql.query(query, []);
      result(null, {
        status: res.length ? true : false,
        data: res
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getOccupiedRoomList: async function (userDetails, result) {

    let query = "SELECT r.*,mrd.document_id,mrd.id as mrd_id FROM`" +
      table.room +
      "` as r left join " + table.mapRoomDocument + " as `mrd` ON `r`.`room_id` = `mrd`.`room_id` AND `mrd`.`check_in_status`=\"" + constant.STATUS.ACTIVE + "\" WHERE r.`property_id`=? AND r.room_id IN (SELECT r.room_id FROM `" +
      table.room +
      "` as `r` INNER JOIN `" +
      table.mapRoomDocument +
      "` as `mrd` ON `r`.`room_id` = `mrd`.`room_id` AND `mrd`.`check_in_status`=? WHERE `r`.`property_id`=? AND `r`.`status` =?)";

    try {
      let res = await sql.query(query, [userDetails.property_id, constant.STATUS.ACTIVE, userDetails.property_id, constant.STATUS.LIVE]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getAvailableRoomList: async function (userDetails, result) {

    let query = "SELECT r.*,mrd.document_id FROM`" +
      table.room +
      "` as r left join " + table.mapRoomDocument + " as `mrd` ON `r`.`room_id` = `mrd`.`room_id` WHERE r.`property_id`=? AND r.room_id NOT IN (SELECT r.room_id FROM `" +
      table.room +
      "` as `r` INNER JOIN `" +
      table.mapRoomDocument +
      "` as `mrd` ON `r`.`room_id` = `mrd`.`room_id` AND `mrd`.`check_in_status`=? WHERE `r`.`property_id`=? AND `r`.`status` =?)";

    try {
      let res = await sql.query(query, [userDetails.property_id, constant.STATUS.ACTIVE, userDetails.property_id, constant.STATUS.LIVE]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getDocumentDetailsById: async function (documentId, result) {
    let query = "SELECT dd.given_name,dd.photo,mrd.room_id,mrd.primary_document_id,ifnull(mrd.secondary_document_id,'') as secondary_document_id,dd.adult,dd.child FROM `" +
      table.documentDetails +
      "` as `dd` LEFT JOIN " + table.mapRoomDocument + " as mrd on dd.document_details_id=mrd.document_id AND mrd.check_in_status=\"" + constant.STATUS.ACTIVE + "\" WHERE `dd`.`document_details_id`=?";
    try {
      let res = await sql.query(query, [documentId]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res[0] : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getDocumentDetailsRoomById: async function (documentId, result) {
    let query = "SELECT mrd.id,dd.given_name,mrd.primary_document_id,ifnull(mrd.secondary_document_id,'') as secondary_document_id,mrd.adult,mrd.child,date_format(dd.dob,'%d-%m-%Y') as dob,date_format(dd.created_at,'%d-%m-%Y') as created_at FROM `" +
      table.documentDetails +
      "` as `dd` LEFT JOIN " + table.mapRoomDocument + " as mrd on dd.document_details_id=mrd.document_id AND mrd.check_in_status=\"" + constant.STATUS.ACTIVE + "\" WHERE `dd`.`document_details_id`=?";
    try {
      let res = await sql.query(query, [documentId]);
      let data = [];
      if (res.length > 0) {
        let row = res[0];
        data.push({
          'name': row.given_name,
          'id': row.primary_document_id,
          'age':await getAge(row.created_at,row.dob),
          'adult':row.adult,
          'child':row.child,
          'is':'primary',
          'mrd':row.id
        });
        if (row.secondary_document_id !== '') {
          let secRes = await getSecondaryDocumentDetailsById(row.secondary_document_id,result);
          if(secRes.length > 0){
            for await (let sec of secRes){
              data.push(sec);
            }
          }
        }
      }
      result(null, {
        status: res.length ? true : false,
        data: data ? data : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  changeRooms: async function (req, result) {
    let insertQuery = '';
    let roomchangedate = moment(req.room_change_date, "DD-MM-YYYY HH:mm").format('YYYY-MM-DD HH:mm:ss');
    let getRoomDetailQuery = "SELECT * FROM "+ table.mapRoomDocument + " WHERE `document_id` =? AND `check_in_status` = ?"
    let roomresp;
    try {
      roomresp = await sql.query(getRoomDetailQuery, [req.document_id, constant.STATUS.ACTIVE]);
    } catch (error) {
      console.log(error);
     
    }
    let updateQuery = "UPDATE `" +
      table.mapRoomDocument +
      "` SET `check_in_status`=?,`modified_at`=?,`modified_by`=? WHERE `room_id`=? AND `document_id` =?";
    try {
      let row = await sql.query(updateQuery, [constant.STATUS.DEACTIVE, currentDateTime, req.userDetails.user_id, req.from_room_id, req.document_id]);
      if (row.affectedRows > 0) {
        insertQuery =
          "INSERT INTO `" +
          table.mapRoomDocument +
          "` (`room_id`,`document_id`,`primary_document_id`,`secondary_document_id`,`check_in_status`,`check_in_date`,`created_at`,`created_by`,`from_room_id`,`is_room_changed`,`room_check_in_type`,`adult`,`child`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
      }

      await sql.query(insertQuery, [req.to_room_id, req.document_id, roomresp[0].primary_document_id, roomresp[0].secondary_document_id, constant.STATUS.ACTIVE, roomchangedate, roomchangedate, req.userDetails.user_id, req.from_room_id, constant.STATUS.YES, req.room_check_in_type,roomresp[0].adult,roomresp[0].child]);
      result(null, { status: true, msg: "successfully created" });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  updateCheckout: async function (req, result) {
    // checkoutOption, primaryUser,secondaryUsers
    if (req.checkoutOption == 'partial') {
      // string covert from the string
      // let _secondUsersList = req.secondaryUsers.split(',');
      // // remove the seconday user from the string
      // _.remove(_secondUsersList, function (e) {
      //   return e === req.primaryUser;
      // });

      _secondUsersList = req.secondaryUsers ? req.secondaryUsers.join(',') : null;
      try {
        // await sql.query("START TRANSACTION");
        // checkout the existing primary user
	   let roomcheckoutdate = moment(req.room_checkout_date, "DD-MM-YYYY HH:mm").format('YYYY-MM-DD HH:mm:ss');
        await sql.query('UPDATE ' + table.mapRoomDocument + ' SET check_in_status=?, `room_check_out_type`=? , `check_out_date`=? WHERE id=?', [constant.STATUS.DEACTIVE, req.checkoutType, roomcheckoutdate, req.mrdId]);
        // add new primary user details
        await insertNewCheckoutDetails(req, _secondUsersList, result);
        // await sql.query("COMMIT");
      } catch (error) {
        // await sql.query("ROLLBACK");
        console.log(error);
        result(error, null);
      }


    } else {
      let roomcheckoutdate = moment(req.room_checkout_date, "DD-MM-YYYY HH:mm").format('YYYY-MM-DD HH:mm:ss');
      let updateQuery = "UPDATE `" +
        table.mapRoomDocument +
        "` SET `check_in_status`=?,`check_out_date`=?,`modified_at`=?,`modified_by`=?, `room_check_out_type`=? WHERE `room_id`=? AND `document_id` =? AND `check_in_status`=?";
      try {
        let row = await sql.query(updateQuery, [constant.STATUS.DEACTIVE, roomcheckoutdate, currentDateTime, req.userDetails.user_id,req.checkoutType, req.from_room_id, req.document_id, constant.STATUS.ACTIVE]);
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
    }
  }, getRoomCounts: async function (userDetails, propertyId, result) {
    result(null, {
      status: true,
      data: {
        available: await getAvailableCount(propertyId),
        occupied: await getOccupiedCount(propertyId),
        inTray: await getInTrayCount(propertyId),
        processing: await getProcessingCount(propertyId)
      }
    });
  }, getPropertyList: async function (userDetails, result) {
    let adminId = userDetails.user_type === constant.USER_TYPE.ADMIN ? userDetails.user_id : userDetails.admin_id;
    let query = "SELECT property_id,`name` FROM `" +
      table.property +
      "` WHERE `admin_id`=? AND status=?";
    try {
      let res = await sql.query(query, [adminId, constant.STATUS.LIVE]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }
};
async function getAvailableCount(propertyId) {

  let query = "SELECT count(*) as available FROM`" +
    table.room +
    "` WHERE `property_id`=? AND `status`='L' AND room_id NOT IN (SELECT r.room_id FROM `" +
    table.room +
    "` as `r` INNER JOIN `" +
    table.mapRoomDocument +
    "` as `mrd` ON `r`.`room_id` = `mrd`.`room_id` AND `mrd`.`check_in_status`=? WHERE `r`.`property_id`=? AND `r`.`status` =?)";

  try {
    let res = await sql.query(query, [propertyId, constant.STATUS.ACTIVE, propertyId, constant.STATUS.LIVE]);

    return res[0].available;
  } catch (error) {
    console.log(error);

  }
}

//get count in tray
async function getInTrayCount(propertyId) {
  let query = "SELECT count(*) as in_tray FROM`" +
    table.documentDetails +
    "` WHERE `property_id`=? AND `is_submitted`=? AND `status` =?";

  try {
    let res = await sql.query(query, [propertyId, constant.STATUS.NO, constant.STATUS.LIVE]);
    return res[0].in_tray;
  } catch (error) {
    console.log(error);

  }
}

//get count processing
async function getProcessingCount(propertyId) {
  let query = "SELECT count(*) as processing FROM`" +
    table.documentDetails +
    "` WHERE `property_id`=? AND `is_submitted`=? AND `status` =? AND nationality NOT IN(?)";

  try {
    let res = await sql.query(query, [propertyId, constant.STATUS.NO, constant.STATUS.LIVE, 'IND']);
    return res[0].processing;
  } catch (error) {
    console.log(error);

  }
}

async function getOccupiedCount(propertyId) {
  let query = "SELECT count(*) as unavailable FROM`" +
    table.room +
    "` WHERE `property_id`=? AND room_id IN (SELECT r.room_id FROM `" +
    table.room +
    "` as `r` INNER JOIN `" +
    table.mapRoomDocument +
    "` as `mrd` ON `r`.`room_id` = `mrd`.`room_id` AND `mrd`.`check_in_status`=? WHERE `r`.`property_id`=? AND `r`.`status` =?)";
  try {
    let res = await sql.query(query, [propertyId, constant.STATUS.ACTIVE, propertyId, constant.STATUS.LIVE]);
    return res[0].unavailable;
  } catch (error) {
    console.log(error);

  }

}
async function getPageOffsetData(
  offset,
  noOfRecordsPerPage,
  adminId,
  whereSearch,
  result
) {
  let query =
    'SELECT r.*,date_format(r.created_at,"%d-%m-%Y") as created_at, p.name as property_name,ifnull(mrd.check_in_status,\'' + constant.STATUS.NO + '\') as room_status, rt.name as room_type  FROM `' +
    table.room +
    "` as r LEFT JOIN " + table.roomType + " as rt on r.room_type_id=rt.room_type_id left join " + table.property + " as p on r.property_id=p.property_id LEFT JOIN " + table.mapRoomDocument + " as mrd on r.room_id=mrd.room_id AND mrd.check_in_status=\"" + constant.STATUS.ACTIVE + "\"  WHERE r.admin_id=? AND r.`status`=? " +
    whereSearch +
    "  order by r.room_id desc LIMIT ?,?";
  try {

    let res = await sql.query(query, [adminId, constant.STATUS.LIVE, offset, noOfRecordsPerPage]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function validateRoomExist(roomId, propertyId) {
  let query =
    "SELECT * FROM `" +
    table.room +
    "`  WHERE `property_id`=? AND `status`=? AND `name`=?";
  try {
    let res = await sql.query(query, [propertyId, constant.STATUS.LIVE, roomId]);
    return res.length ? true : false;
  } catch (error) {
    console.log(error);
  }
}

async function insertNewCheckoutDetails(req, secondaryUsers, result) {
  let roomcheckoutdate = moment(req.room_checkout_date, "DD-MM-YYYY HH:mm").format('YYYY-MM-DD HH:mm:ss');
  insertQuery =
    "INSERT INTO `" +
    table.mapRoomDocument +
    "` (`room_id`,`document_id`,`check_in_status`,`check_in_date`,`created_at`,`created_by`,`primary_document_id`,`secondary_document_id`,`adult`,`child`) VALUES(?,?,?,?,?,?,?,?,?,?)";

    updateQuery = "UPDATE `" + table.documentDetails + "` SET `adult`=?,`child`=? WHERE `document_details_id`=?";
    try {
      await sql.query(updateQuery, [req.adult,req.child,req.primaryUser]);
    } catch (error) {
      console.log(error);
    }
  try {
    await sql.query(insertQuery, [req.from_room_id, req.primaryUser, constant.STATUS.ACTIVE, roomcheckoutdate, currentDateTime, req.userDetails.user_id, req.primaryUser, secondaryUsers,req.adult,req.child]);
    result(null, { status: true, msg: "successfully updated" });
  } catch (error) {
    console.log(error);
    // await sql.query("ROLLBACK");
  }



}
async function getSecondaryDocumentDetailsById(documentId, result) {
  let query = "SELECT given_name,document_details_id,date_format(dob,'%d-%m-%Y') as dob, date_format(created_at,'%d-%m-%Y') as created_at FROM `" +
    table.documentDetails +
    "` WHERE `document_details_id` IN(?)";
  try {
    let res = await sql.query(query, [documentId.split(',')]);
    let data = [];
    if (res.length > 0) {
      for await (let row of res) {
        data.push({
          'name': row.given_name,
          'id': row.document_details_id,
          'age':await getAge(row.created_at,row.dob),
          'is':'secondary'
        });
      }
    }
    return data;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getAge(docDate, dob) {
  return Math.floor(moment(docDate,"DD-MM-YYYY").diff(moment(dob, "DD-MM-YYYY"), 'years', true));
}
