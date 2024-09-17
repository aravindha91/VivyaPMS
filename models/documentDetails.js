var sql = require("../config/db.js");
var table = require("../config/tables");
var moment = require("moment");
let currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
var constant = require('../config/constant');
var fs = require('fs');

module.exports = {
  create: async function (request, result) {

    var dtype, img1,  guest_id_return, img2, img3, compressed_buffer, country_code;
    const pAttachment = request["attachments-primary"];
    const bAttachment = request["attachments-back"];

    let primaryAttachmentData;
    try {
      primaryAttachmentData = JSON.parse(pAttachment);
    } catch (e) {
      console.error("Invalid JSON format in attachments-primary", e);
      return result(e, null);
    }
 
    let dTypequery =
      'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at FROM `' +
      table.documentType +
      "` WHERE `status`=? AND `id`=?";
    let doc_type_result;
    try {
      doc_type_result = await sql.query(dTypequery, [
        constant.STATUS.LIVE,
        request["document_type"],
      ]);
    } catch (error) {
      console.error("Error fetching document type:", error);
      return result(error, null);
    }
 
    dtype = doc_type_result[0]?.short_name;
 
    // dtype = primaryAttachmentData?.ocrData?.ocrData?.type;
    // img2 = primaryAttachmentData?.ocrData?.ocrData?.img;
 
    docFile = primaryAttachmentData?.fileName;
    // docFile = request['profilePhoto']? request['profilePhoto'] : "";
 
    faceFileName = request["profilePhoto"] ? request["profilePhoto"] : "";
    // Read and convert the face image to base64
    if (faceFileName) {
      const faceImagePath = __dirname + "/../uploads/" + faceFileName;
      try {
        const faceImageData = await fs.promises.readFile(faceImagePath);
        img3 = faceImageData.toString("base64");
      } catch (err) {
        console.error("Error reading face image file:", err);
        return result(err, null);
      }
    }
 
    if (docFile) {
      const path = __dirname + "/../uploads/" + docFile;
 
      // Read the file asynchronously and await its completion
      try {
        const data = await fs.promises.readFile(path);
        img1 = data.toString("base64");
      } catch (err) {
        console.error("Error reading file:", err);
        return result(err, null);
      }
    } else {
      console.error("File name not found in primaryAttachmentData");
      return result(
        new Error("File name not found in primaryAttachmentData"),
        null
      );
    }
 
    let backAttachmentData, backDocFile;
    try {
      if (request["attachments-back"]) {
        backAttachmentData = JSON.parse(bAttachment);
        backDocFile = backAttachmentData?.fileName;
        // let img2;
        if (backDocFile) {
          const backFilePath = __dirname + "/../uploads/" + backDocFile;
 
          try {
            const data = await fs.promises.readFile(backFilePath);
            img2 = data.toString("base64");
          } catch (err) {
            console.error("Error reading back file:", err);
            return result(err, null);
          }
        } else {
          console.error("File name not found in backAttachmentData");
          return result(
            new Error("File name not found in backAttachmentData"),
            null
          );
        }
      } else {
        backDocFile = "";
        img2 = "";
      }
    } catch (e) {
      console.error("Invalid JSON format in attachments-back", e);
      return result(e, null);
    }
 
    let countryQuery =
      'SELECT *,DATE_FORMAT(`created_at`,"%d-%m-%Y") as created_at FROM `' +
      table.country +
      "` WHERE `status`=? AND `id`=?";
    let country_result;
    try {
      country_result = await sql.query(countryQuery, [
        constant.STATUS.LIVE,
        request["nationality"],
      ]);
    } catch (error) {
      console.error("Error fetching country details:", error);
      return result(error, null);
    }
 
    if (!country_result || country_result.length === 0) {
      console.error("No country found for the given nationality");
      return result(
        new Error("No country found for the given nationality"),
        null
      );
    }
 
    country_code = country_result[0]?.short_name;

    let query =
      "INSERT INTO `" +
      table.documentDetails +
      "` (`admin_id`,`property_id`,`duration_of_stay`,`duration_stay_india`,`date_of_arrival_in_india`,`arriving_from`,`next_destination`,`native_country_address`,`arrived_from_port`,`arrived_at_port`,`address_in_india`,`register_no`,`rfid_room_key`,`c_form_no`,`adult`,`child`,`check_in_date_time`,`given_name`,`family_name`,`gender`,`nationality`,`dob`,`visit_purpose`,`nationality_by_birth`,`parentage`,`document_type`,`email`,`phone`,`passport_number`,`passport_date_of_issue`,`passport_valid_till`,`passport_place_of_issue`,`passport_place_of_issue_country`,`address`,`visa_number`,`visa_date_of_issue`,`visa_valid_till`,`visa_place_of_issue_city`,`visa_place_of_issue_country`,`type_of_visa`,`visa_no_of_entry`,`photo`,`created_by`,`created_at`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    // await sql.query("START TRANSACTION");
    try {
      var checkoutDate = request["check_in_date_time"] ? moment(request["check_in_date_time"], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm") : null;

      if (request['room-occupied-status'] === constant.STATUS.ACTIVE) { // A room active (occupaid)
        await sql.query('UPDATE ' + table.mapRoomDocument + ' SET `check_in_status`=?, `check_out_date`=? WHERE `room_id`=? AND `check_in_status`=?', [constant.STATUS.DEACTIVE, checkoutDate, request['room_id'], constant.STATUS.ACTIVE]);
      }
      console.log("##############CheckInDate",request["check_in_date_time"])
      let sqlRes = await sql.query(query, [
        request.userDetails.admin_id,
        request.userDetails.property_id,
        request["duration_of_stay"] ? request["duration_of_stay"] : null,
        request["duration_stay_india"] ? request["duration_stay_india"] : null,
        request["date_of_arrival_in_india"] ? moment(request["date_of_arrival_in_india"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["arriving_from"] ? request["arriving_from"] : null,
        request["next_destination"] ? request["next_destination"] : null,
        request["native_country_address"] ? request["native_country_address"] : null,
        request["arrived_from_port"] ? request["arrived_from_port"] : null,
        request["arrived_at_port"] ? request["arrived_at_port"] : null,
        request["address_in_india"] ? request["address_in_india"] : null,
        request["register_no"] ? request["register_no"] : null,
        request["rfid_room_key"] ? request["rfid_room_key"] : null,
        request["c_form_no"] ? request["c_form_no"] : null,
        request["adult"] ? request["adult"] : null,
        request["child"] ? request["child"] : null,
        request["check_in_date_time"] ? moment(request["check_in_date_time"], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm") : null,
        request["given_name"] ? request["given_name"] : null,
        request["family_name"] ? request["family_name"] : null,
        request["gender"] ? request["gender"] : null,
        request["nationality"] ? request["nationality"] : null,
        request["dob"] ? moment(request["dob"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["visit_purpose"] ? request["visit_purpose"] : null,
        request["nationality_by_birth"] ? request["nationality_by_birth"] : null,
        request["parentage"] ? request["parentage"] : null,
        request["document_type"] ? request["document_type"] : null,
        request["email"] ? request["email"] : null,
        request["phone"] ? request["phone"] : null,
        request["passport_number"] ? request["passport_number"] : null,
        request["passport_date_of_issue"] ? moment(request["passport_date_of_issue"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["passport_valid_till"] ? moment(request["passport_valid_till"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["passport_place_of_issue"] ? request["passport_place_of_issue"] : null,
        request["passport_place_of_issue_country"] ? request["passport_place_of_issue_country"] : null,
        request["address"] ? request["address"] : null,
        request["visa_number"] ? request["visa_number"] : null,
        request["visa_date_of_issue"] ? moment(request["visa_date_of_issue"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["visa_valid_till"] ? moment(request["visa_valid_till"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["visa_place_of_issue_city"] ? request["visa_place_of_issue_city"] : null,
        request["visa_place_of_issue_country"] ? request["visa_place_of_issue_country"] : null,
        request["type_of_visa"] ? request["type_of_visa"] : null,
        request["visa_no_of_entry"] ? request["visa_no_of_entry"] : null,
        request["profilePhoto"] ? request["profilePhoto"] : null, // change the photo attachemen
        request.userDetails.user_id,
        checkoutDate
      ]);
      let documentId = sqlRes.insertId;
      await mapRoomAndDocument(request['room_id'], request["adult"], request["child"], documentId, result);

      let attachmentForDoc = [];
      try {
        if (request["attachments-primary"] !== "") {
          attachmentForDoc.push(JSON.parse(request["attachments-primary"]));
        }
        if (request["attachments-back"] !== "") {
          attachmentForDoc.push(JSON.parse(request["attachments-back"]));
        }
 
        if (request["attachments-secondary"] !== "") {
          for (let f of JSON.parse(request["attachments-secondary"])) {
            attachmentForDoc.push(f);
          }
        }
 
       
      } catch (error) {
        console.error("Error parsing attachment data:", error);
        return result(error, null);
      }

      if (attachmentForDoc.length > 0) {
        await insertDocumentAttachment(documentId, attachmentForDoc, result);
      }
      // await sql.query("COMMIT");
      result(null, {
        status: true,
        msg: "Successfully created",
        docId: documentId
      });
    } catch (error) {
      // await sql.query("ROLLBACK");
      console.log(error);
      result(error, null);
    }
  },
  createGuest: async function (request, result) {
    let query =
      "INSERT INTO `" +
      table.documentDetails +
      "` (`admin_id`,`property_id`,`duration_of_stay`,`duration_stay_india`,`date_of_arrival_in_india`,`arriving_from`,`next_destination`,`native_country_address`,`arrived_from_port`,`arrived_at_port`,`address_in_india`,`register_no`,`rfid_room_key`,`c_form_no`,`adult`,`child`,`check_in_date_time`,`given_name`,`family_name`,`gender`,`nationality`,`dob`,`visit_purpose`,`nationality_by_birth`,`parentage`,`document_type`,`email`,`phone`,`passport_number`,`passport_date_of_issue`,`passport_valid_till`,`passport_place_of_issue`,`passport_place_of_issue_country`,`address`,`visa_number`,`visa_date_of_issue`,`visa_valid_till`,`visa_place_of_issue_city`,`visa_place_of_issue_country`,`type_of_visa`,`visa_no_of_entry`,`photo`,`created_by`,`created_at`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    try {
      // await sql.query("START TRANSACTION");
      let sqlRes = await sql.query(query, [
        request.userDetails.admin_id,
        request.userDetails.property_id,
        request["duration_of_stay"] ? request["duration_of_stay"] : null,
        request["duration_stay_india"] ? request["duration_stay_india"] : null,
        request["date_of_arrival_in_india"] ? moment(request["date_of_arrival_in_india"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["arriving_from"] ? request["arriving_from"] : null,
        request["next_destination"] ? request["next_destination"] : null,
        request["native_country_address"] ? request["native_country_address"] : null,
        request["arrived_from_port"] ? request["arrived_from_port"] : null,
        request["arrived_at_port"] ? request["arrived_at_port"] : null,
        request["address_in_india"] ? request["address_in_india"] : null,
        request["register_no"] ? request["register_no"] : null,
        request["rfid_room_key"] ? request["rfid_room_key"] : null,
        request["c_form_no"] ? request["c_form_no"] : null,
        request["adult"] ? request["adult"] : null,
        request["child"] ? request["child"] : null,
        request["check_in_date_time"] ? moment(request["check_in_date_time"], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm") : null,
        request["given_name"] ? request["given_name"] : null,
        request["family_name"] ? request["family_name"] : null,
        request["gender"] ? request["gender"] : null,
        request["nationality"] ? request["nationality"] : null,
        request["dob"] ? moment(request["dob"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["visit_purpose"] ? request["visit_purpose"] : null,
        request["nationality_by_birth"] ? request["nationality_by_birth"] : null,
        request["parentage"] ? request["parentage"] : null,
        request["document_type"] ? request["document_type"] : null,
        request["email"] ? request["email"] : null,
        request["phone"] ? request["phone"] : null,
        request["passport_number"] ? request["passport_number"] : null,
        request["passport_date_of_issue"] ? moment(request["passport_date_of_issue"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["passport_valid_till"] ? moment(request["passport_valid_till"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["passport_place_of_issue"] ? request["passport_place_of_issue"] : null,
        request["passport_place_of_issue_country"] ? request["passport_place_of_issue_country"] : null,
        request["address"] ? request["address"] : null,
        request["visa_number"] ? request["visa_number"] : null,
        request["visa_date_of_issue"] ? moment(request["visa_date_of_issue"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["visa_valid_till"] ? moment(request["visa_valid_till"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        request["visa_place_of_issue_city"] ? request["visa_place_of_issue_city"] : null,
        request["visa_place_of_issue_country"] ? request["visa_place_of_issue_country"] : null,
        request["type_of_visa"] ? request["type_of_visa"] : null,
        request["visa_no_of_entry"] ? request["visa_no_of_entry"] : null,
        request["profilePhoto"] ? request["profilePhoto"] : null, // change the photo attachemen
        request.userDetails.user_id,
        currentDateTime
      ]);
      let documentId = sqlRes.insertId;

      let attachmentForDoc = [];
      if (request['attachments-primary'] !== '') {
        attachmentForDoc.push(JSON.parse(request['attachments-primary']));
      }
      if (request['attachments-secondary'] !== '') {
        for (let f of JSON.parse(request['attachments-secondary'])) {
          attachmentForDoc.push(f);
        }
      }
      if (attachmentForDoc.length > 0) {
        await insertDocumentAttachment(documentId, attachmentForDoc, result);
      }
      await addGuestToPrimaryRoom(request['primaryDocId'], documentId, result);

      // await sql.query("COMMIT");
      result(null, {
        status: true,
        msg: "Successfully created",
      });
    } catch (error) {
      // await sql.query("ROLLBACK");
      console.log(error);
      result(error, null);
    }
  },
  update: async function (id, request, result) {
    let query = "";
    let params = [];
    let setColumn = request["profilePhoto"] ? ` ,photo="${request["profilePhoto"]}" ` : '';
    query =
      "UPDATE `" +
      table.documentDetails +
      "` SET `property_id`=?,`duration_of_stay`=?,`duration_stay_india`=?,`date_of_arrival_in_india`=?,`arriving_from`=?,`next_destination`=?,`native_country_address`=?,`arrived_from_port`=?,`arrived_at_port`=?,`address_in_india`=?,`register_no`=?,`rfid_room_key`=?,`c_form_no`=?,`adult`=?,`child`=?,`check_in_date_time`=?,`given_name`=?,`family_name`=?,`gender`=?,`nationality`=?,`dob`=?,`visit_purpose`=?,`nationality_by_birth`=?,`parentage`=?,`document_type`=?,`email`=?,`phone`=?,`passport_number`=?,`passport_date_of_issue`=?,`passport_valid_till`=?,`passport_place_of_issue`=?,`passport_place_of_issue_country`=?,`address`=?,`visa_number`=?,`visa_date_of_issue`=?,`visa_valid_till`=?,`visa_place_of_issue_city`=?,`visa_place_of_issue_country`=?,`type_of_visa`=?,`visa_no_of_entry`=?,`modified_by`=?,`modified_at`=? " + setColumn + " WHERE `document_details_id`=?";

      updateQuery =
      "UPDATE `" +
      table.mapRoomDocument +
      "` SET `adult`=?,`child`=? WHERE `document_id`=?";

      try {
        await sql.query(updateQuery, [request["adult"], request["child"], id]);
      } catch (error) {
        console.log(error);
      }


    params = [
      request.userDetails.property_id,
      request["duration_of_stay"] ? request["duration_of_stay"] : null,
      request["duration_stay_india"] ? request["duration_stay_india"] : null,
      request["date_of_arrival_in_india"] ? moment(request["date_of_arrival_in_india"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["arriving_from"] ? request["arriving_from"] : null,
      request["next_destination"] ? request["next_destination"] : null,
      request["native_country_address"] ? request["native_country_address"] : null,
      request["arrived_from_port"] ? request["arrived_from_port"] : null,
      request["arrived_at_port"] ? request["arrived_at_port"] : null,
      request["address_in_india"] ? request["address_in_india"] : null,
      request["register_no"] ? request["register_no"] : null,
      request["rfid_room_key"] ? request["rfid_room_key"] : null,
      request["c_form_no"] ? request["c_form_no"] : null,
      request["adult"] ? request["adult"] : null,
      request["child"] ? request["child"] : null,
      request["check_in_date_time"] ? moment(request["check_in_date_time"], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm") : null,
      request["given_name"] ? request["given_name"] : null,
      request["family_name"] ? request["family_name"] : null,
      request["gender"] ? request["gender"] : null,
      request["nationality"] ? request["nationality"] : null,
      request["dob"] ? moment(request["dob"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["visit_purpose"] ? request["visit_purpose"] : null,
      request["nationality_by_birth"] ? request["nationality_by_birth"] : null,
      request["parentage"] ? request["parentage"] : null,
      request["document_type"] ? request["document_type"] : null,
      request["email"] ? request["email"] : null,
      request["phone"] ? request["phone"] : null,
      request["passport_number"] ? request["passport_number"] : null,
      request["passport_date_of_issue"] ? moment(request["passport_date_of_issue"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["passport_valid_till"] ? moment(request["passport_valid_till"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["passport_place_of_issue"] ? request["passport_place_of_issue"] : null,
      request["passport_place_of_issue_country"] ? request["passport_place_of_issue_country"] : null,
      request["address"] ? request["address"] : null,
      request["visa_number"] ? request["visa_number"] : null,
      request["visa_date_of_issue"] ? moment(request["visa_date_of_issue"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["visa_valid_till"] ? moment(request["visa_valid_till"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["visa_place_of_issue_city"] ? request["visa_place_of_issue_city"] : null,
      request["visa_place_of_issue_country"] ? request["visa_place_of_issue_country"] : null,
      request["type_of_visa"] ? request["type_of_visa"] : null,
      request["visa_no_of_entry"] ? request["visa_no_of_entry"] : null,
      request.userDetails.user_id,
      currentDateTime,
      id
    ];
    try {
      // await sql.query("START TRANSACTION");
      if (request['room-occupied-status'] === constant.STATUS.ACTIVE) { // A room active (occupaid)
        await sql.query('UPDATE ' + table.mapRoomDocument + ' SET `check_in_status`=? WHERE `room_id`=? AND `check_in_status`=?', [constant.STATUS.DEACTIVE, request['room_id'], constant.STATUS.ACTIVE]);
      }
      // else{
      //   await '';
      // }
      await sql.query(query, params);

      let attachmentForDoc = [];
      if (request['attachments-primary'] !== '') {
        attachmentForDoc.push(JSON.parse(request['attachments-primary']));
      }
      if (request['attachments-secondary'] !== '') {
        for (let f of JSON.parse(request['attachments-secondary'])) {
          attachmentForDoc.push(f);
        }
      }
      if (attachmentForDoc.length > 0) {
        await insertDocumentAttachment(id, attachmentForDoc, result);
      }

      // await sql.query("COMMIT");
      result(null, {
        status: true,
        msg: "Successfully updated",
      });
    } catch (error) {
      // await sql.query("ROLLBACK");
      console.log(error);
      result(error, null);
    }
  },
  updateReporcess: async function (id, request, result) {
    let query = "";
    let params = [];
    let setColumn = request["profilePhoto"] ? ` ,photo="${request["profilePhoto"]}" ` : '';
    query =
      "UPDATE `" +
      table.documentDetails +
      "` SET `property_id`=?,`duration_of_stay`=?,`duration_stay_india`=?,`date_of_arrival_in_india`=?,`arriving_from`=?,`next_destination`=?,`native_country_address`=?,`arrived_from_port`=?,`arrived_at_port`=?,`address_in_india`=?,`register_no`=?,`rfid_room_key`=?,`c_form_no`=?,`adult`=?,`child`=?,`check_in_date_time`=?,`given_name`=?,`family_name`=?,`gender`=?,`nationality`=?,`dob`=?,`visit_purpose`=?,`nationality_by_birth`=?,`parentage`=?,`document_type`=?,`email`=?,`phone`=?,`passport_number`=?,`passport_date_of_issue`=?,`passport_valid_till`=?,`passport_place_of_issue`=?,`passport_place_of_issue_country`=?,`address`=?,`visa_number`=?,`visa_date_of_issue`=?,`visa_valid_till`=?,`visa_place_of_issue_city`=?,`visa_place_of_issue_country`=?,`type_of_visa`=?,`visa_no_of_entry`=?,`modified_by`=?,`modified_at`=?,`is_submitted`=\"" + constant.STATUS.NO + "\" " + setColumn + " WHERE `document_details_id`=?";

    params = [
      request.userDetails.property_id,
      request["duration_of_stay"] ? request["duration_of_stay"] : null,
      request["duration_stay_india"] ? request["duration_stay_india"] : null,
      request["date_of_arrival_in_india"] ? moment(request["date_of_arrival_in_india"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["arriving_from"] ? request["arriving_from"] : null,
      request["next_destination"] ? request["next_destination"] : null,
      request["native_country_address"] ? request["native_country_address"] : null,
      request["arrived_from_port"] ? request["arrived_from_port"] : null,
      request["arrived_at_port"] ? request["arrived_at_port"] : null,
      request["address_in_india"] ? request["address_in_india"] : null,
      request["register_no"] ? request["register_no"] : null,
      request["rfid_room_key"] ? request["rfid_room_key"] : null,
      request["c_form_no"] ? request["c_form_no"] : null,
      request["adult"] ? request["adult"] : null,
      request["child"] ? request["child"] : null,
      request["check_in_date_time"] ? moment(request["check_in_date_time"], "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm") : null,
      request["given_name"] ? request["given_name"] : null,
      request["family_name"] ? request["family_name"] : null,
      request["gender"] ? request["gender"] : null,
      request["nationality"] ? request["nationality"] : null,
      request["dob"] ? moment(request["dob"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["visit_purpose"] ? request["visit_purpose"] : null,
      request["nationality_by_birth"] ? request["nationality_by_birth"] : null,
      request["parentage"] ? request["parentage"] : null,
      request["document_type"] ? request["document_type"] : null,
      request["email"] ? request["email"] : null,
      request["phone"] ? request["phone"] : null,
      request["passport_number"] ? request["passport_number"] : null,
      request["passport_date_of_issue"] ? moment(request["passport_date_of_issue"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["passport_valid_till"] ? moment(request["passport_valid_till"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["passport_place_of_issue"] ? request["passport_place_of_issue"] : null,
      request["passport_place_of_issue_country"] ? request["passport_place_of_issue_country"] : null,
      request["address"] ? request["address"] : null,
      request["visa_number"] ? request["visa_number"] : null,
      request["visa_date_of_issue"] ? moment(request["visa_date_of_issue"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["visa_valid_till"] ? moment(request["visa_valid_till"], "DD/MM/YYYY").format("YYYY-MM-DD") : null,
      request["visa_place_of_issue_city"] ? request["visa_place_of_issue_city"] : null,
      request["visa_place_of_issue_country"] ? request["visa_place_of_issue_country"] : null,
      request["type_of_visa"] ? request["type_of_visa"] : null,
      request["visa_no_of_entry"] ? request["visa_no_of_entry"] : null,
      request.userDetails.user_id,
      currentDateTime,
      id
    ];

    try {
      // await sql.query("START TRANSACTION");
      if (request['room-occupied-status'] === constant.STATUS.ACTIVE) { // A room active (occupaid)
        await sql.query('UPDATE ' + table.mapRoomDocument + ' SET `check_in_status`=? WHERE `room_id`=? AND `check_in_status`=?', [constant.STATUS.DEACTIVE, request['room_id'], constant.STATUS.ACTIVE]);
      }
      // else{
      //   await '';
      // }
      await sql.query(query, params);

      let documentId = id;
      await mapRoomAndDocument(request['room_id'], request["adult"], request["child"], documentId, result);

      let attachmentForDoc = [];
      if (request['attachments-primary'] !== '') {
        attachmentForDoc.push(JSON.parse(request['attachments-primary']));
      }
      if (request['attachments-secondary'] !== '') {
        for (let f of JSON.parse(request['attachments-secondary'])) {
          attachmentForDoc.push(f);
        }
      }
      if (attachmentForDoc.length > 0) {
        await insertDocumentAttachment(documentId, attachmentForDoc, result);
      }

      // await sql.query("COMMIT");
      result(null, {
        status: true,
        msg: "Successfully updated",
      });
    } catch (error) {
      // await sql.query("ROLLBACK");
      console.log(error);
      result(error, null);
    }
  },
  getAll: async function (
    offset,
    noOfRecordsPerPage,
    search,
    userDetails,
    filterOption,
    result
  ) {
    noOfRecordsPerPage = parseInt(noOfRecordsPerPage);
    let whereSearch = search
      ? "AND ( `dd`.`given_name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  `dd`.`c_form_no` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  `dd`.`passport_number` LIKE '%" +
      search +
      "%' ESCAPE '!' OR  `dd`.`family_name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR date_format(`dd`.`dob`,'%d-%m-%Y') LIKE '%" +
      search +
      "%' ESCAPE '!' OR `dd`.`email` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `c`.`name` LIKE '%" +
      search +
      "%' ESCAPE '!' OR `dd`.`phone` LIKE '%" +
      search +
      "%' ESCAPE '!' )"
      : "";

    let whereFilterOption = '';
    switch (filterOption) {
      case 'all':
        whereFilterOption = ' AND dd.is_submitted=\'' + constant.STATUS.NO + '\' ';
        break;
      case 'foreign':
        whereFilterOption = ' AND c.short_name <> \'IND\' AND dd.is_submitted=\'' + constant.STATUS.NO + '\'';
        break;
      case 'processed':
        whereFilterOption = ' AND c.short_name <> \'IND\' AND dd.is_submitted=\'' + constant.STATUS.YES + '\'';
        break;
      default:
        whereFilterOption = ' AND dd.is_submitted=\'' + constant.STATUS.YES + '\'';
        break;
    }

    let adminId = userDetails.user_type === constant.USER_TYPE.ADMIN ? userDetails.user_id : userDetails.admin_id;
    let query =
      "SELECT dd.*,ifnull(mrd.room_id,'') as room_id,ifnull(`r`.`name`,'') as room_name FROM `" +
      table.documentDetails +
      "` as `dd` LEFT JOIN `" +
      table.property +
      "` AS `p` ON `dd`.`property_id`=`p`.`property_id` LEFT JOIN " +
      table.mapRoomDocument +
      " as mrd on `dd`.`document_details_id`=`mrd`.`document_id` AND `mrd`.`check_in_status`=\"" + constant.STATUS.ACTIVE + "\" LEFT JOIN " + table.room + " as r on mrd.room_id=r.room_id LEFT JOIN " + table.country + " as `c` on `c`.`id`=`dd`.`nationality` left join " + table.documentType + " as dt on dd.document_type=dt.id WHERE `dd`.`admin_id`=? AND `dd`.`status`=? " + whereFilterOption +
      whereSearch;


      try {
        let rowCount = await sql.query(query, [adminId, constant.STATUS.LIVE]);
        let totalRows = rowCount.length;
        let totalPages = Math.ceil(totalRows / noOfRecordsPerPage);
      
        // Fetch data using getPageOffsetData
        let data = await getPageOffsetData(
          offset,
          noOfRecordsPerPage,
          whereSearch,
          adminId,
          filterOption,
          whereFilterOption
        );
      
        // Send the response once, including all relevant data
        result(null, {
          status: true,
          totalPages: totalPages,
          data: data,
        });
      } catch (error) {
        console.error(error);
        // Handle error and send an appropriate response
        result(error, null);
      }
      
  },
  
  getById: async function (id, result) {
    let query =
      'SELECT p.name as property_name, p.contact_number, p.website, p.mobile_number, p.manager_name, p.registration_id, p.po_box,p.email, p.address,p.city,p.state, p.pin, dd.*, date_format(dd.date_of_arrival_in_india,"%d/%m/%Y") as date_of_arrival_in_india,DATE_FORMAT(dd.`check_in_date_time`,"%d-%m-%Y %H:%i") as check_in_date_time, date_format(dd.dob,"%d/%m/%Y") as dob,date_format(dd.passport_date_of_issue,"%d/%m/%Y") as passport_date_of_issue,date_format(dd.passport_valid_till,"%d/%m/%Y") as passport_valid_till,date_format(dd.visa_date_of_issue,"%d/%m/%Y") as visa_date_of_issue,date_format(dd.visa_valid_till,"%d/%m/%Y") as visa_valid_till,mrd.room_id FROM `' +
      table.documentDetails +
      "`  as dd LEFT JOIN " + table.property + " as p on dd.property_id=p.property_id LEFT JOIN " + table.mapRoomDocument + " as mrd on dd.document_details_id=mrd.document_id AND mrd.check_in_status=\"" + constant.STATUS.ACTIVE + "\" WHERE dd.`document_details_id`=?";

    try {
      let row = await sql.query(query, [id]);
      let _attachment = await getAttahments(row[0].document_details_id);
      
      result(null, { status: true, data: row[0], attachments: _attachment });
     
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  viewDocumentById: async function (id, result) {
    let query =
      'SELECT dd.*, DATE_FORMAT(dd.`created_at`,"%d-%m-%Y") as created_date, date_format(dd.dob,"%d/%m/%Y") as dob,date_format(dd.date_of_arrival_in_india,"%d/%m/%Y") as date_of_arrival_in_india,date_format(dd.check_in_date_time,"%d/%m/%Y %H:%i") as check_in_date_time,date_format(dd.passport_date_of_issue,"%d/%m/%Y") as passport_date_of_issue,date_format(dd.passport_valid_till,"%d/%m/%Y") as passport_valid_till,TIME_FORMAT(dd.visa_date_of_issue,"%d/%m/%Y") as visa_date_of_issue,date_format(dd.visa_valid_till,"%d/%m/%Y") as visa_valid_till,mrd.room_id FROM `' +
      table.documentDetails +
      "`  as dd LEFT JOIN " + table.mapRoomDocument + " as mrd on dd.document_details_id=mrd.document_id AND mrd.check_in_status=\"" + constant.STATUS.ACTIVE + "\" WHERE dd.`document_details_id`=?";

    try {
      let row = await sql.query(query, [id]);
      let _attachment = await getAttahments(row[0].document_details_id);
      result(null, { status: true, data: row[0], attachments: _attachment });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  moveToFile: async function (id, result) {
    let query =
      "UPDATE `" +
      table.documentDetails +
      '` SET `is_submitted`=\'' + constant.STATUS.YES + '\'  WHERE `document_details_id`=?';
    try {
      let row = await sql.query(query, [id]);
      result(null, {
        status: row.affectedRows > 0 ? true : false,
        changes: row.changedRows > 0 ? true : false,
        msg:
          row.affectedRows > 0
            ? row.changedRows > 0
              ? "Successfully moved"
              : "Not moved, try again"
            : "move the document failed, try again",
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getDropDownList: async function (req, result) {

    let data = {
      country: await getCountryList(req.userDetails.admin_id, result),
      documentType: await getDocumentTypeList(req.userDetails.admin_id, result),
      purposeToVisit: await getPurposeToVisitList(req.userDetails.admin_id, result),
      specialCategory: await getSpecialCategoryList(req.userDetails.admin_id, result),
      visaType: await getVisaTypesList(req.userDetails.admin_id, result),
    }
    result(null, { status: true, data: data });
  },
  deleteById: async function (id, result) {
    let query =
      "UPDATE `" +
      table.documentDetails +
      '` SET `status`=\'' + constant.STATUS.DELETED + '\'  WHERE `document_details_id`=?';
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
  },
  submitDataCompleted: async function (_id, result) {
    let query =
      "UPDATE `" +
      table.documentDetails +
      "` SET `restore_data`=? WHERE `document_details_id`=?";
    try {
      let res = await sql.query(query, [constant.STATUS.YES, _id]);
      result(null, { status: true });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getDestinationData: async function (userDetails, result) {

    let adminId = userDetails.user_type === constant.USER_TYPE.ADMIN ? userDetails.user_id : userDetails.admin_id;
    let query =
      'SELECT dd.*,date_format(dd.date_of_arrival_in_india,"%d/%m/%Y") as date_of_arrival_in_india,date_format(dd.dob,"%d/%m/%Y") as dob,date_format(dd.passport_date_of_issue,"%d/%m/%Y") as passport_date_of_issue,date_format(dd.passport_valid_till,"%d/%m/%Y") as passport_valid_till,date_format(dd.visa_date_of_issue,"%d/%m/%Y") as visa_date_of_issue,date_format(dd.visa_valid_till,"%d/%m/%Y") as visa_valid_till,date_format(dd.check_in_date_time,"%d/%m/%Y") as check_in_date_time,  c.short_name as country_short_name, c.name as country_name,psc.short_name as passport_short_name_country,psc.name as passport_country_name,vsc.short_name as visa_short_name_country,vsc.name as visa_country_name,vt.short_name as visa_type_short_name,vt.name as visa_type_name,afc.name as arraiving_from_country,afc.short_name as arraiving_from_short_name_country,pv.name as visit_purpose_name,p.name as prty_name,p.po_box as prty_po_box,p.address as prty_address,p.city as prty_city,p.state as prty_state,p.pin as prty_pin,p.contact_number as prty_contact_number,p.mobile_number as prty_mobile_number,date_format(dd.check_in_date_time,"%d/%m/%Y") as check_in_date,date_format(dd.check_in_date_time,"%H:%i") as check_in_time,nxd.name as next_destination_name,dd.photo FROM `' +
      table.documentDetails +
      "` as `dd` LEFT JOIN `" +
      table.property +
      "` AS `p` ON `dd`.`property_id`=`p`.`property_id` LEFT JOIN " + table.propertyType + " as pt on p.property_type_id=pt.property_type_id LEFT JOIN " + table.country + " as c on dd.nationality=c.id LEFT JOIN " + table.country + " as psc on dd.passport_place_of_issue_country=psc.id LEFT JOIN " + table.country + " as vsc on dd.passport_place_of_issue_country=vsc.id  LEFT JOIN " + table.country + " as afc on dd.arriving_from=afc.id LEFT JOIN " + table.country + " as nxd on nxd.id=dd.next_destination  LEFT JOIN " + table.visaType + " as vt on dd.type_of_visa=vt.id LEFT JOIN " + table.purposeToVisit + " as pv on dd.visit_purpose=pv.id WHERE `dd`.`status`=? AND `dd`.`is_submitted`=? AND `c`.`short_name` NOT IN(\'IND\') AND `dd`.`admin_id`=? ORDER BY `dd`.`document_details_id` DESC ";
    try {
      let res = await sql.query(query, [constant.STATUS.LIVE, constant.STATUS.NO, adminId]);
      console.log("###########res",res);
      let data = [];
      for await (let row of res) {
        // row.age = await getAge(row.check_in_date_time, row.dob);
        var imageAsBase64 = '';
        if (row.photo !== '' && row.photo !== null && row.photo !== 'null') {
          const path = __dirname + '/../uploads/' + row.photo;
          try {
            if (fs.existsSync(path)) {
              //file exists
              imageAsBase64 = await fs.readFileSync(path, 'base64');
            }
          } catch (err) {
            console.error(err)
          }
        }
        row.picBlob = imageAsBase64;
        data.push(row);
      }

      result(null, { status: true, data: res.length ? data : [] });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  // getDestinationUrl: async function (id, result) {
  //   let query =
  //     "SELECT meta_value as url  FROM `" +
  //     table.setting +
  //     "`  WHERE meta_key=? ";
  //     console.log(query);
  //   try {
  //     let res = await sql.query(query, ["destination_url"]);
  //     //console.log(res);
  //     result(null, {
  //       status: res.length ? true : false,
  //       data: res.length ? res[0] : [],
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     result(error, null);
  //   }
  // },
  getDestinationUrl: async function (id, result) {
    console.log("Function getDestinationUrl called");
    let query =
      "SELECT meta_value as url  FROM `" +
      table.setting +
      "`  WHERE meta_key=? ";
    console.log(query);
    try {
      let res = await sql.query(query, ["destination_url"]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res[0] : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
},
  getInHouseData: async function (request, result) {
    let query =
      "SELECT c.name,count(d.nationality) as data_count FROM `" +
      table.documentDetails +
      "`  as d LEFT JOIN " + table.country + " as c on d.nationality=c.id WHERE d.status=? AND date_format(d.created_at,'%Y-%m-%d') >= '" + moment(request.body.fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") + "' AND date_format(d.created_at,'%Y-%m-%d') <= '" + moment(request.body.endDate, "DD-MM-YYYY").format("YYYY-MM-DD") + "' AND d.property_id='" + request.propertyId + "' and d.nationality IS NOT NULL group by d.nationality";
    try {
      let res = await sql.query(query, [constant.STATUS.LIVE]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res : [],
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  getWeeklyData: async function (request, result) {
    let fromDate = moment(request.body.fromDate, "DD-MM-YYYY").format('YYYY-MM-DD');
    let endDate = moment(request.body.endDate, "DD-MM-YYYY").format('YYYY-MM-DD');
    let dateList = await getBetweenDates(fromDate, endDate);

    let query =
      "SELECT count(nationality) as data_count, date_format(created_at,'%Y-%m-%d') as check_in_date FROM `" +
      table.documentDetails +
      "`  WHERE status=? AND date_format(created_at,'%Y-%m-%d') >= '" + moment(request.body.fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") + "' AND date_format(created_at,'%Y-%m-%d') <= '" + moment(request.body.endDate, "DD-MM-YYYY").format("YYYY-MM-DD") + "' AND property_id='" + request.propertyId + "' group by date_format(created_at,'%Y-%m-%d') order by created_at asc";
    try {

      let res = await sql.query(query, [constant.STATUS.LIVE]);
      result(null, {
        status: res.length ? true : false,
        data: res.length ? res : [],
        dateList: dateList
      });
    } catch (error) {
      console.log(error);
      result(error, null);
    }
  },
  setApplicationID:
    async function (request, result) {

      let query =
        "UPDATE `" +
        table.documentDetails +
        "` SET `c_form_no`=?,`is_submitted`='Y' WHERE `document_details_id`=?";
      try {
        let row = await sql.query(query, [
          request.applicationId,
          request.docId
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
    }
};
async function getPageOffsetData(
  offset,
  noOfRecordsPerPage,
  whereSearch,
  adminId,
  filterOption,
  whereFilterOption,
  result
) {

  let query =
    'SELECT `dd`.*,`p`.`name` as property_name,DATE_FORMAT(`dd`.`created_at`,"%d-%m-%Y") as created_date,ifnull(mrd.room_id,"") as room_id,ifnull(`r`.`name`,"") as room_name,ifnull(mrd.primary_document_id,"") as primary_document_id,`c`.`short_name` as nationality_short_name,`c`.`name` as document_nationality,date_format(dd.passport_valid_till,"%d-%m-%Y") as passport_valid_till,date_format(dd.passport_date_of_issue,"%d-%m-%Y") as  passport_date_of_issue, dt.name as document_type_name  FROM `' +
    table.documentDetails +
    "` as `dd` LEFT JOIN `" +
    table.property +
    "` AS `p` ON `dd`.`property_id`=`p`.`property_id` LEFT JOIN " +
    table.mapRoomDocument +
    " as mrd on `dd`.`document_details_id`=`mrd`.`document_id` AND `mrd`.`check_in_status`=\'A\' LEFT JOIN " + table.room + " as r on mrd.room_id=r.room_id LEFT JOIN " + table.country + " as `c` on `c`.`id`=`dd`.`nationality` left join " + table.documentType + " as dt on dd.document_type=dt.id  WHERE dd.admin_id=? AND `dd`.`status`=? " + whereFilterOption +
    whereSearch +
    " group by dd.document_details_id ORDER BY `dd`.`document_details_id` DESC LIMIT ?,?";
  try {
    let res = await sql.query(query, [
      adminId,
      constant.STATUS.LIVE,
      offset,
      noOfRecordsPerPage,
    ]);
    if (res.length) {
      for (let i of res) {
        i.attachments = await getAttahments(i.document_details_id);
      }
    } else {
      res = [];
    }
    return res;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function insertDocumentAttachment(documentId, attachedFiles, result) {
  let j = 1;
  let queryValue = '';
  for (let file of attachedFiles) {
    if (typeof file.deleted === "undefined") {
      let docType = type ? type : "";
      let isPrimary = file.isPrimary
        ? "primary"
        : file.isBack
        ? "back"
        : "secondary";
      queryValue += j === 1 ? `VALUE(${documentId},"","${file.fileName}","","${file.ext}","${file.thumbnail}","${docType}","${isPrimary}")` : `,(${documentId},"","${file.fileName}","","${file.ext}","${file.thumbnail}","${docType}","${isPrimary}")`;
      j++;
    }
  }
  let query =
    "INSERT INTO " +
    table.attachment +
    " (`document_id`,`file_path`,`file_name`,`file_size`,`file_ext`,`thumbnail`,`document_type`,`attachment_type`) " + queryValue;
  try {
    await sql.query(query, []);
  } catch (error) {
    // await sql.query("ROLLBACK");
    console.log(error);
    result(error, null);
  }
}
async function mapRoomAndDocument(roomId, adult, child, documentId, result) {

  let query =
    "INSERT INTO " +
    table.mapRoomDocument +
    " (`room_id`,`document_id`,`primary_document_id`,`adult`,`child`) VALUE(?,?,?,?,?)";
  try {
    let res = await sql.query(query, [
      roomId,
      documentId,
      documentId,
      adult ? adult : null,
      child ? child : null,
    ]);
  } catch (error) {
    // await sql.query("ROLLBACK");
    console.log(error);
    result(error, null);
  }

}
async function addGuestToPrimaryRoom(primaryDocId, documentId, result) {
  let primaryDocDetails = await getPrimayDocDetails(primaryDocId, result);

  let secondaryDocId;
  let existingGuest = [];
  if (primaryDocDetails.secondary_document_id) {
    existingGuest = (primaryDocDetails.secondary_document_id).split(',');
  }
  existingGuest.push(documentId);
  secondaryDocId = existingGuest.join(',');
  let query =
    "UPDATE " +
    table.mapRoomDocument +
    " SET `secondary_document_id`=? WHERE `id`=?";
  try {
    await sql.query(query, [
      secondaryDocId,
      primaryDocDetails.id
    ]);
    return true;
  } catch (error) {
    // await sql.query("ROLLBACK");
    console.log(error);
    result(error, null);
  }

}
async function getPrimayDocDetails(primaryDocId, result) {
  let query =
    "SELECT * FROM " +
    table.mapRoomDocument +
    " WHERE `document_id`=? AND `check_in_status`=?";
  try {
    let res = await sql.query(query, [primaryDocId, constant.STATUS.ACTIVE]);
    return res[0];
  } catch (error) {
    // await sql.query("ROLLBACK");
    console.log(error);
    result(error, null);
  }

}
async function getAttahments(documentId) {
  let query = "SELECT * FROM `" + table.attachment + "` WHERE `document_id`=?";

  try {
    let row = await sql.query(query, [documentId]);
    return row;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function deleteExistingAttachment(documentId) {
  let query = "DELETE FROM `" + table.attachment + "` WHERE `document_id`=?";
  try {
    let row = await sql.query(query, [documentId]);
    return true;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getBetweenDates(fromDate, endDate) {
  let dateList = [];
  while (!moment(fromDate).isSame(endDate)) {
    dateList.push(fromDate);
    fromDate = moment(fromDate, "YYYY-MM-DD").add(1, 'day').format("YYYY-MM-DD");
  }
  dateList.push(endDate);
  return dateList;
}
async function getCountryList(adminID, result) {
  let query = "SELECT * FROM `" + table.country + "` WHERE `admin_id`=\"" + adminID + "\" and `is_active`='A' and `status`=\"" + constant.STATUS.LIVE + "\"";

  try {
    let row = await sql.query(query, []);
    return row;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getDocumentTypeList(adminID, result) {
  let query = "SELECT * FROM `" + table.documentType + "` WHERE `admin_id`=\"" + adminID + "\" and `is_active`='A' and  `status`=\"" + constant.STATUS.LIVE + "\" order by name asc";

  try {
    let row = await sql.query(query, []);
    return row;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getPurposeToVisitList(adminID, result) {
  let query = "SELECT * FROM `" + table.purposeToVisit + "` WHERE `admin_id`=\"" + adminID + "\"  and `is_active`='A' and  `status`=\"" + constant.STATUS.LIVE + "\" order by name asc";

  try {
    let row = await sql.query(query, []);
    return row;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getSpecialCategoryList(adminID, result) {
  let query = "SELECT * FROM `" + table.specialCategory + "` WHERE `admin_id`=\"" + adminID + "\" and  `status`=\"" + constant.STATUS.LIVE + "\" order by name asc";

  try {
    let row = await sql.query(query, []);
    return row;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getVisaTypesList(adminID, result) {
  let query = "SELECT * FROM `" + table.visaTypes + "` WHERE `admin_id`=\"" + adminID + "\"  and `is_active`='A' and  `status`=\"" + constant.STATUS.LIVE + "\" order by name asc";

  try {
    let row = await sql.query(query, []);
    return row;
  } catch (error) {
    console.log(error);
    result(error, null);
  }
}
async function getAge(docDate, dob) {
  return Math.floor(moment(docDate, "DD/MM/YYYY").diff(moment(dob, "DD/MM/YYYY"), 'years', true));
}
