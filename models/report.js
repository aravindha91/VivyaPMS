var sql = require("../config/db.js");
var table = require("../config/tables");
var moment = require("moment");
var _ = require('lodash');
let currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
var constant = require('../config/constant');
module.exports = {
  getCheckIn: async function (request, offset, noOfRecordsPerPage, search, result) {
    let whereSearch = search
      ? "AND ( `d`.`f_form_no`=\'" + search + "\' LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";
      
    let fromDate = moment(request.body.fromDate, "DD/MM/YYYY").format("YYYY-MM-DD");
    let endDate = moment(request.body.endDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    let query =
      "select `d`.* from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') >= '" + fromDate + "' AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <='" + endDate + "'"
    try {

      let rowCount = await sql.query(query, [request.body.property]);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getCheckInData(
          request.body.property,
          fromDate,
          endDate,
          offset,
          noOfRecordsPerPage,
          request.userDetails.user_id,
          whereSearch,
          result
        ),
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getCheckOut: async function (request, offset, noOfRecordsPerPage, search, result) {
    let whereSearch = search
      ? "AND ( `d`.`c_form_no`=\'" + search + "\' LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";
    let fromDate = moment(request.body.fromDate, "DD/MM/YYYY").format("YYYY-MM-DD");
    let endDate = moment(request.body.endDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    let query =
      "select `d`.* from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`check_out_date`,'%Y-%m-%d') >= '" + fromDate + "' AND date_format(`mrd`.`check_out_date`,'%Y-%m-%d') <='" + endDate + "'"
    try {

      let rowCount = await sql.query(query, [request.body.property]);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getCheckOutData(
          request.body.property,
          fromDate,
          endDate,
          offset,
          noOfRecordsPerPage,
          request.userDetails.user_id,
          whereSearch,
          result
        ),
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getInHouse: async function (request, offset, noOfRecordsPerPage, search, result) {
    let whereSearch = search
      ? "AND ( `d`.`c_form_no`=\'" + search + "\' LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";
    let fromDate = moment(request.body.fromDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    let query =
      "select `d`.* from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') = '" + fromDate + "'"
    try {

      let rowCount = await sql.query(query, [request.body.property]);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getInHouseData(
          request.body.property,
          fromDate,
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
  getMonthly: async function (request, offset, noOfRecordsPerPage, search, page, result) {
    let whereSearch = search
      ? "AND ( " + search + "\' LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";

    let fromDate = moment(request.body.fromDate, "DD/MM/YYYY").format("YYYY-MM-DD");
    let endDate = moment(request.body.endDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    // get check in, check out, room change count

    let allData = [];

    // check in data 
    let checkInData = await getCheckInCount(request.body.property, fromDate, endDate, result);
    let checkOutData = await getCheckOutCount(request.body.property, fromDate, endDate, result);
    let roomChangeData = await getRoomChangeCount(request.body.property, fromDate, endDate, result);

    // combaine all result
    // push to check in count
    if (checkInData.length) {
      for await (let ci of checkInData) {
        allData.push({
          check_in_count: ci.check_in_count,
          check_out_count: 0,
          room_change_count: 0,
          date: ci.check_in_date
        });
      }
    }
    // push to check out count
    if (checkOutData.length) {
      for await (let co of checkOutData) {
        let keyExist = await _.findIndex(allData, (e) => {
          return e.date == co.check_out_date;
        }, 0);

        if (keyExist > 0) {
          allData[keyExist].check_out_count = co.check_out_count;
        } else {
          allData.push({
            check_in_count: 0,
            check_out_count: co.check_out_count,
            room_change_count: 0,
            date: co.check_out_date
          });
        }
      }
    }

    // push to room change count
    if (roomChangeData.length) {
      for await (let rc of roomChangeData) {
        let keyExist = await _.findIndex(allData, (e) => {
          return e.date == rc.room_change_date;
        }, 0);

        if (keyExist > 0) {
          allData[keyExist].room_change_count = rc.room_change_count;
        } else {
          allData.push({
            check_in_count: 0,
            check_out_count: 0,
            room_change_count: rc.room_change_count,
            date: rc.room_change_date
          });
        }
      }
    }

    const sortedArrayArray = await _.orderBy(allData, [(obj) => new Date(moment(obj.date, "DD-MM-YYYY").format('YYYY-MM-DD'))], ['asc']);

    // merge the count
    let sortedArray = [];
    let oldDate = '';

    for await (let j of sortedArrayArray) {
      if (oldDate === j.date) {
        sortedArray[j.date].check_in_count = parseInt(sortedArray[j.date].check_in_count) + parseInt(j.check_in_count);
        sortedArray[j.date].check_out_count = parseInt(sortedArray[j.date].check_out_count) + parseInt(j.check_out_count);
        sortedArray[j.date].room_change_count = parseInt(sortedArray[j.date].room_change_count) + parseInt(j.room_change_count);
      } else {
        sortedArray[j.date] = j;
        oldDate = j.date;
      }
    }

    let removedKeyArray = [];
    // remove key
    for await (const [key, val] of Object.entries(sortedArray)) {
      removedKeyArray.push(val);
    }
    let paginateRes = await paginate(removedKeyArray, noOfRecordsPerPage, page);

    let totalPages = Math.ceil(allData.length / noOfRecordsPerPage);
    result(null, {
      status: true,
      totalPages: totalPages,
      data: paginateRes,
    });
  },

  getNationality: async function (request, offset, noOfRecordsPerPage, search, result) {
    let whereSearch = search
      ? "AND ( LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";

    let query =
      ""
      +
      whereSearch;
    try {
      let rowCount = await sql.query(query, []);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getNationalityData(
          offset,
          noOfRecordsPerPage,
          request.userDetails.user_id,
          whereSearch,
          result
        ),
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getProcessedRecord: async function (request, offset, noOfRecordsPerPage, search, result) {
    let whereSearch = search
      ? "AND ( `d`.`c_form_no`=\'" + search + "\' LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";
    let fromDate = moment(request.body.fromDate, "DD/MM/YYYY").format("YYYY-MM-DD");
    let endDate = moment(request.body.endDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    let query =
      "select `d`.* from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` WHERE `d`.`is_submitted`=\"" + constant.STATUS.YES + "\" AND `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') >= '" + fromDate + "' AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <='" + endDate + "'"
    try {

      let rowCount = await sql.query(query, [request.body.property]);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getProcessedRecordData(
          request.body.property,
          fromDate,
          endDate,
          offset,
          noOfRecordsPerPage,
          request.userDetails.user_id,
          whereSearch,
          result
        ),
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getRoomChange: async function (request, offset, noOfRecordsPerPage, search, result) {
    let whereSearch = search
      ? "AND ( `d`.`c_form_no`=\'" + search + "\' LIKE '%" +
      search +
      "%' ESCAPE '!')"
      : "";
    let fromDate = moment(request.body.fromDate, "DD/MM/YYYY").format("YYYY-MM-DD");
    let endDate = moment(request.body.endDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    let query =
      "select `d`.* from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id`  LEFT JOIN " + table.room + " as frm on mrd.from_room_id=frm.room_id LEFT JOIN " + table.room + " as trm on mrd.room_id=trm.room_id WHERE `mrd`.`is_room_changed`=\"" + constant.STATUS.YES + "\"  AND `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') >= '" + fromDate + "' AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <='" + endDate + "'"
    try {

      let rowCount = await sql.query(query, [request.body.property]);
      let totalRows = rowCount.length;
      let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      result(null, {
        status: true,
        totalPages: totalPages,
        data: await getRoomChangeData(
          request.body.property,
          fromDate,
          endDate,
          offset,
          noOfRecordsPerPage,
          request.userDetails.user_id,
          whereSearch,
          result
        ),
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },

  // export excel pdf
  getCheckInDataExport: async function (data, result) {
    data.fromDate = moment(data.fromDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    data.endDate = moment(data.endDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    let query =
      "select `d`.`family_name`,`d`.`given_name`,`d`.`passport_number`,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type` from " + table.documentDetails + " as `d` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND date_format(`d`.`created_at`,'%Y-%m-%d') >= ? AND date_format(`d`.`created_at`,'%Y-%m-%d') <=?";
    try {
      let res = await sql.query(query, [data.propertyId, data.fromDate, data.endDate]);
      result(null, { res });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }, getInHouseDataExport: async function (data, result) {
    data.fromDate = moment(data.fromDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    let query =
      "select `d`.`family_name`,`d`.`given_name`,`d`.`c_form_no`,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') = ? ";
    try {
      let res = await sql.query(query, [data.propertyId, data.fromDate, data.endDate]);
      result(null, { res });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }, getCheckOutDataExport: async function (data, result) {
    data.fromDate = moment(data.fromDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    data.endDate = moment(data.endDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    let query =
      "select `d`.`family_name`,`d`.`given_name`,`d`.`passport_number`,date_format(`mrd`.`check_out_date`,'%d-%m-%Y') as `document_check_out_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`check_out_date`,'%Y-%m-%d') >= ? AND date_format(`mrd`.`check_out_date`,'%Y-%m-%d') <=? AND `mrd`.`check_in_status`=?";
    try {
      let res = await sql.query(query, [data.propertyId, data.fromDate, data.endDate, constant.STATUS.DEACTIVE]);
      result(null, { res });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }, getInHouseDataExport: async function (data, result) {
    data.fromDate = moment(data.fromDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    let query =
      "select `d`.`given_name`,d.family_name,`d`.`passport_number` as document_number ,date_format(`mrd`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <= ? AND `mrd`.`check_in_status` = ? ";
    try {
      let res = await sql.query(query, [data.propertyId, data.fromDate, constant.STATUS.ACTIVE]);
      result(null, { res });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },  getMonthlyDataExport: async function (request, result) {
    let fromDate = moment(request.fromDate, "DD/MM/YYYY").format("YYYY-MM-DD");
    let endDate = moment(request.endDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    // get check in, check out, room change count

    let allData = [];

    // check in data 
    let checkInData = await getCheckInCount(request.propertyId, fromDate, endDate, result);
    let checkOutData = await getCheckOutCount(request.propertyId, fromDate, endDate, result);
    let roomChangeData = await getRoomChangeCount(request.propertyId, fromDate, endDate, result);

    // combaine all result
    // push to check in count
    if (checkInData.length) {
      for await (let ci of checkInData) {
        allData.push({
          check_in_count: ci.check_in_count,
          check_out_count: 0,
          room_change_count: 0,
          date: ci.check_in_date
        });
      }
    }
    // push to check out count
    if (checkOutData.length) {
      for await (let co of checkOutData) {
        let keyExist = await _.findIndex(allData, (e) => {
          return e.date == co.check_out_date;
        }, 0);

        if (keyExist > 0) {
          allData[keyExist].check_out_count = co.check_out_count;
        } else {
          allData.push({
            check_in_count: 0,
            check_out_count: co.check_out_count,
            room_change_count: 0,
            date: co.check_out_date
          });
        }
      }
    }

    // push to room change count
    if (roomChangeData.length) {
      for await (let rc of roomChangeData) {
        let keyExist = await _.findIndex(allData, (e) => {
          return e.date == rc.room_change_date;
        }, 0);

        if (keyExist > 0) {
          allData[keyExist].room_change_count = rc.room_change_count;
        } else {
          allData.push({
            check_in_count: 0,
            check_out_count: 0,
            room_change_count: rc.room_change_count,
            date: rc.room_change_date
          });
        }
      }
    }

    const sortedArrayArray = await _.orderBy(allData, [(obj) => new Date(moment(obj.date, "DD-MM-YYYY").format('YYYY-MM-DD'))], ['asc']);

    // merge the count
    let sortedArray = [];
    let oldDate = '';

    for await (let j of sortedArrayArray) {
      if (oldDate === j.date) {
        sortedArray[j.date].check_in_count = parseInt(sortedArray[j.date].check_in_count) + parseInt(j.check_in_count);
        sortedArray[j.date].check_out_count = parseInt(sortedArray[j.date].check_out_count) + parseInt(j.check_out_count);
        sortedArray[j.date].room_change_count = parseInt(sortedArray[j.date].room_change_count) + parseInt(j.room_change_count);
      } else {
        sortedArray[j.date] = j;
        oldDate = j.date;
      }
    }

    let removedKeyArray = [];
    // remove key
    for await (const [key, val] of Object.entries(sortedArray)) {
      removedKeyArray.push(val);
    }

    result(null, { removedKeyArray });
  },getProcessedRecordDataExport: async function (data, result) {
    data.fromDate = moment(data.fromDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    data.endDate = moment(data.endDate, "DD/MM/YYYY").format('YYYY-MM-DD');
      let query =
    "select `d`.`family_name`,`d`.`given_name`,`d`.`c_form_no`,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type`,date_format(`mrd`.`check_out_date`,'%d-%m-%Y') as `document_check_out_date` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND `d`.`is_submitted`=\"" + constant.STATUS.YES + "\" AND date_format(`mrd`.`created_at`,'%Y-%m-%d') >= ? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <=?";

    try {
      let res = await sql.query(query, [data.propertyId, data.fromDate, data.endDate]);
      result(null, { res });
    } catch (error) {
      console.log(error);
      result(error, null);
    }

  },getRoomChangeDataExport: async function (data, result) {
    data.fromDate = moment(data.fromDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    data.endDate = moment(data.endDate, "DD/MM/YYYY").format('YYYY-MM-DD');
    let query =
    "select `d`.`given_name`,`d`.`family_name`,`d`.`passport_number`,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt .name as `document_type`,date_format(`mrd`.`check_out_date`,'%d-%m-%Y') as `document_check_out_date`, `frm`.`name` as from_room, `trm`.name as to_room, date_format(`mrd`.`created_at`,'%d-%m-%Y') as `room_change_date` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` LEFT JOIN " + table.room + " as frm on mrd.from_room_id=frm.room_id LEFT JOIN " + table.room + " as trm on mrd.room_id=trm.room_id WHERE `mrd`.`is_room_changed`=\""+constant.STATUS.YES+"\" AND  `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') >= ? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <=?";

    try {
      let res = await sql.query(query, [data.propertyId, data.fromDate, data.endDate]);
      result(null, { res });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },getDashboardInHouseData: async function (request, result) {

      let query =
      "SELECT c.name,count(d.nationality) as data_count FROM `" +
      table.documentDetails +
      "`  as d LEFT JOIN "+table.country+" as c on d.nationality=c.id WHERE d.status=? AND date_format(d.created_at,'%Y-%m-%d') >= '" + moment(request.fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") + "' AND date_format(d.created_at,'%Y-%m-%d') <= '" + moment(request.endDate, "DD-MM-YYYY").format("YYYY-MM-DD") + "' AND d.property_id=? and d.nationality IS NOT NULL group by d.nationality";

    try {
      let res = await sql.query(query, [constant.STATUS.LIVE,request.propertyId]);
      result(null, {res});
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },dashboardWeeklyCheckinDataExport:async function(request,result){
    let query =
      "SELECT count(nationality) as data_count, date_format(created_at,'%Y-%m-%d') as check_in_date FROM `" +
      table.documentDetails +
      "`  WHERE status=? AND date_format(created_at,'%Y-%m-%d') >= '" + moment(request.fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") + "' AND date_format(created_at,'%Y-%m-%d') <= '" + moment(request.endDate, "DD-MM-YYYY").format("YYYY-MM-DD") + "' AND property_id='" + request.propertyId + "' group by date_format(created_at,'%Y-%m-%d') order by created_at asc";
    try {

      let res = await sql.query(query, [constant.STATUS.LIVE]);
      result(null, {res});
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  }
}

// sub functions
async function getCheckInData(
  propertyId,
  fromDate,
  endDate,
  offset,
  noOfRecordsPerPage,
  adminId,
  whereSearch,
  result
) {
  // let query =
  //   "select `d`.`given_name`,`d`.`c_form_no` as document_number,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type`,`d`.`family_name` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') >= ? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <=? LIMIT ?,?";

  let query =
  "select `d`.`given_name`,`d`.`passport_number` as document_number,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,`d`.`document_type`,`dt`.`name`,`d`.`family_name` from " + table.documentDetails + " as `d` LEFT JOIN "+ table.documentType +" as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND date_format(`d`.`created_at`,'%Y-%m-%d') >= ? AND date_format(`d`.`created_at`,'%Y-%m-%d') <=? AND `d`.`document_type`=`dt`.`id` LIMIT ?,?"; 
  
  
  try {
    let res = await sql.query(query, [propertyId, fromDate, endDate,
      offset,
      noOfRecordsPerPage,
    ]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function getCheckOutData(
  propertyId,
  fromDate,
  endDate,
  offset,
  noOfRecordsPerPage,
  adminId,
  whereSearch,
  result
) {

  let query =
    "select `d`.`given_name`,`d`.`passport_number` as `document_number`,date_format(`mrd`.`check_out_date`,'%d-%m-%Y') as `document_check_out_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type`,`d`.`family_name` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`check_out_date`,'%Y-%m-%d') >= ? AND date_format(`mrd`.`check_out_date`,'%Y-%m-%d') <=? AND `mrd`.`check_in_status`=? LIMIT ?,?";

  try {
    let res = await sql.query(query, [propertyId, fromDate, endDate, constant.STATUS.DEACTIVE,
      offset,
      noOfRecordsPerPage,
    ]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getInHouseData(
  propertyId,
  fromDate,
  offset,
  noOfRecordsPerPage,
  whereSearch,
  result
) {

  let query =
    "select `d`.`given_name`,`d`.`passport_number` as `document_number`,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type`,`d`.`family_name` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <= ? AND `mrd`.`check_in_status`=? LIMIT ?,?";

  try {
    let res = await sql.query(query, [propertyId, fromDate, constant.STATUS.ACTIVE, offset, noOfRecordsPerPage]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function getNationalityData(
  offset,
  noOfRecordsPerPage,
  adminId,
  whereSearch,
  result
) {
  let query = ' LIMIT ?,?';
  try {
    let res = await sql.query(query, [
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

async function getProcessedRecordData(
  propertyId,
  fromDate,
  endDate,
  offset,
  noOfRecordsPerPage,
  adminId,
  whereSearch,
  result
) {
  let query =
    "select `d`.`family_name`,`d`.`given_name`,`d`.`c_form_no`,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type`,date_format(`mrd`.`check_out_date`,'%d-%m-%Y') as `document_check_out_date` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` WHERE `d`.`property_id`=? AND `d`.`is_submitted`=\"" + constant.STATUS.YES + "\" AND date_format(`mrd`.`created_at`,'%Y-%m-%d') >= ? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <=? LIMIT ?,?";

  try {
    let res = await sql.query(query, [propertyId, fromDate, endDate,
      offset,
      noOfRecordsPerPage,
    ]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function getRoomChangeData(
  propertyId,
  fromDate,
  endDate,
  offset,
  noOfRecordsPerPage,
  adminId,
  whereSearch,
  result
) {
  let query =
    "select `d`.`given_name`,`d`.`family_name`,`d`.`passport_number`,date_format(`d`.`created_at`,'%d-%m-%Y') as `document_check_in_date`,date_format(`d`.`passport_date_of_issue`,'%d-%m-%Y') as `issue_date`,date_format(`d`.`passport_valid_till`,'%d-%m-%Y') as `valid_date`,dt.name as `document_type`,date_format(`mrd`.`check_out_date`,'%d-%m-%Y') as `document_check_out_date`, `frm`.`name` as from_room, `trm`.name as to_room, date_format(`mrd`.`created_at`,'%d-%m-%Y') as `room_change_date` from " + table.mapRoomDocument + " as `mrd` LEFT JOIN " + table.documentDetails + " as `d` ON `mrd`.`document_id`=`d`.`document_details_id` LEFT JOIN " + table.documentType + " as `dt` ON `d`.`document_type`=`dt`.`id` LEFT JOIN " + table.room + " as frm on mrd.from_room_id=frm.room_id LEFT JOIN " + table.room + " as trm on mrd.room_id=trm.room_id WHERE `mrd`.`is_room_changed`=\""+constant.STATUS.YES+"\" AND  `d`.`property_id`=? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') >= ? AND date_format(`mrd`.`created_at`,'%Y-%m-%d') <=? LIMIT ?,?";

  try {
    let res = await sql.query(query, [propertyId, fromDate, endDate,
      offset,
      noOfRecordsPerPage,
    ]);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function getCheckInCount(
  propertyId,
  fromDate,
  endDate,
  result
) {
  let query =
    "select count(*) as check_in_count,date_format(mrd.created_at,'%d-%m-%Y') as check_in_date from " + table.mapRoomDocument + " as mrd left join " + table.documentDetails + " as dd on mrd.document_id=dd.document_details_id where date_format(mrd.created_at,'%Y-%m-%d') >='" + fromDate + "' AND date_format(mrd.created_at,'%Y-%m-%d') <= '" + endDate + "' AND mrd.check_in_status=\"" + constant.STATUS.ACTIVE + "\" AND dd.property_id=\"" + propertyId + "\" group by date_format(mrd.created_at,'%Y-%m-%d')";

  try {
    let res = await sql.query(query, []);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function getCheckOutCount(
  propertyId,
  fromDate,
  endDate,
  result
) {
  let query =
    "select count(*) as check_out_count,date_format(mrd.check_out_date,'%d-%m-%Y') as check_out_date from " + table.mapRoomDocument + " as mrd left join " + table.documentDetails + " as dd on mrd.document_id=dd.document_details_id where date_format(mrd.check_out_date,'%Y-%m-%d') >='" + fromDate + "' AND date_format(mrd.check_out_date,'%Y-%m-%d') <= '" + endDate + "'  AND mrd.check_in_status=\"" + constant.STATUS.DEACTIVE + "\" AND dd.property_id=\"" + propertyId + "\" group by date_format(mrd.check_out_date,'%Y-%m-%d')";

  try {
    let res = await sql.query(query, []);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function getRoomChangeCount(
  propertyId,
  fromDate,
  endDate,
  result
) {
  let query =
    "select count(*) as room_change_count,date_format(mrd.created_at,'%d-%m-%Y') as room_change_date from " + table.mapRoomDocument + " as mrd left join " + table.documentDetails + " as dd on mrd.document_id=dd.document_details_id where date_format(mrd.created_at,'%Y-%m-%d') >='" + fromDate + "' AND date_format(mrd.created_at,'%Y-%m-%d') <= '" + endDate + "' AND mrd.is_room_changed=\"" + constant.STATUS.YES + "\" AND dd.property_id=\"" + propertyId + "\" group by date_format(mrd.created_at,'%Y-%m-%d')";

  try {
    let res = await sql.query(query, []);
    return res.length ? res : [];
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}

async function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return await array.slice((page_number - 1) * page_size, page_number * page_size);
}
