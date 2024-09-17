/*
 Author: Jayamurugan
 Description: API router
 */

//import plugins
const express = require("express");
const user = require("../controllers/userManagement");
const { validateToken, validateTokenGet } = require("../middleware/auth");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const router = express.Router();

// user
const userManagementController = require("../controllers/userManagement");

//property
const propertyController = require("../controllers/property");

//property type
const propertyTypeController = require("../controllers/propertyType");

//room type
const roomTypeController = require("../controllers/roomType");

//visa type
const visaTypeController = require("../controllers/visaType");

// admin
const adminManagementController = require("../controllers/adminManagement");

// document details
const documentController = require("../controllers/documentDetails");

// settings
const settingController = require("../controllers/setting");

// room
const roomController = require("../controllers/room");

// report
const reportController = require("../controllers/report");

// export
const exportController = require("../controllers/export");

// contry
const countryController = require('../controllers/country');

// visit purpose
const visitPurposeController = require('../controllers/visitPurpose');

// document type
const documentTypeController = require('../controllers/documentType');

// login as user, admin and super-admin
router.post("/login", userManagementController.login);
router.put(
  "/profile/:id",
  validateToken,
  userManagementController.updateProfile
);

// admin
router
  .post("/admin", validateToken, adminManagementController.create)
  .put("/admin/:id", validateToken, adminManagementController.update)
  .get("/admin", validateToken, adminManagementController.getAll)
  .get("/admin/:id", validateToken, adminManagementController.getById)
  .delete("/admin/:id", validateToken, adminManagementController.deleteById);

// user
router
  .post("/user", validateToken, userManagementController.create)
  .put("/user/:id", validateToken, userManagementController.update)
  .get("/user", validateToken, userManagementController.getAll)
  .get("/user/:id", validateToken, userManagementController.getById)
  .delete("/user/:id", validateToken, userManagementController.deleteById);

//property
router
  .post("/property", validateToken, propertyController.create)
  .put("/property/:id", validateToken, propertyController.update)
  .get("/property", validateToken, propertyController.getAll)
  .get("/property/get-property-details", validateToken, propertyController.getPropertyDetails)
  .get("/property/:id", validateToken, propertyController.getById)
  .delete(
    "/property/:id",
    validateToken,
    propertyController.deleteById
  )
  .get("/get-property-list", validateToken, propertyController.getPropertyList);

//property type
router
  .post("/property-type", validateToken, propertyTypeController.create)
  .put("/property-type/:id", validateToken, propertyTypeController.update)
  .get("/property-type", validateToken, propertyTypeController.getAll)
  .get("/property-type/:id", validateToken, propertyTypeController.getById)
  .delete(
    "/property-type/:id",
    validateToken,
    propertyTypeController.deleteById
  )
  .get("/get-property-type-list", validateToken, propertyTypeController.getPropertyTypeList);


//room type
router
  .post("/room-type", validateToken, roomTypeController.create)
  .put("/room-type/:id", validateToken, roomTypeController.update)
  .get("/room-type", validateToken, roomTypeController.getAll)
  .get("/room-type/:id", validateToken, roomTypeController.getById)
  .delete(
    "/room-type/:id",
    validateToken,
    roomTypeController.deleteById
  )
  .get("/get-room-type-list", validateToken, roomTypeController.getroomTypeList);


//visa type
router
  .post("/visa-type", validateToken, visaTypeController.create)
  .put("/visa-type/:id", validateToken, visaTypeController.update)
  .get("/visa-type", validateToken, visaTypeController.getAll)
  .get("/visa-type/:id", validateToken, visaTypeController.getById)
  .delete(
    "/visa-type/:id",
    validateToken,
    visaTypeController.deleteById
  )
  .get("/get-visa-type-list", validateToken, visaTypeController.getvisaTypeList);

// country
router
  .post("/country", validateToken, countryController.create)
  .put("/country/:id", validateToken, countryController.update)
  .get("/country", validateToken, countryController.getAll)
  .get("/country/:id", validateToken, countryController.getById)
  .delete(
    "/country/:id",
    validateToken,
    countryController.deleteById
  );

// visit purpose
router
  .post("/visit-purpose", validateToken, visitPurposeController.create)
  .put("/visit-purpose/:id", validateToken, visitPurposeController.update)
  .get("/visit-purpose", validateToken, visitPurposeController.getAll)
  .get("/visit-purpose/:id", validateToken, visitPurposeController.getById)
  .delete(
    "/visit-purpose/:id",
    validateToken,
    visitPurposeController.deleteById
  );

  // document type
router
.post("/document-type", validateToken, documentTypeController.create)
.put("/document-type/:id", validateToken, documentTypeController.update)
.get("/document-type", validateToken, documentTypeController.getAll)
.get("/document-type/:id", validateToken, documentTypeController.getById)
.delete(
  "/document-type/:id",
  validateToken,
  documentTypeController.deleteById
);

// document details
router
  .post("/document-details", validateToken, documentController.create)
  .post("/document-details/add-guest/:id", validateToken, documentController.createGuest)
  .post("/document-details/get-ocr", validateToken, documentController.getOcr)
  .post("/document-details/get-document-info", validateToken, documentController.getDocumentInfo)
  .put("/document-details/:id", validateToken, documentController.update)
  .put("/document-details/reprocess/:id", validateToken, documentController.updateReporcess)
  .get("/document-details", validateToken, documentController.getAll)
  .get("/document-details/:id", validateToken, documentController.getById)
  .get("/document-details/view-document/:id", validateToken, documentController.viewDocumentById)
  .get("/document-details/move-to-file/:id", validateToken, documentController.moveToFile)
  .delete("/document-details/:id", validateToken, documentController.deleteById)
  .post(
    "/document-details/upload/document",
    validateToken,
    documentController.uploadDocument
  )
  .post(
    "/document-details/upload/document/delete",
    validateToken,
    documentController.deleteDocument
  );

// room
router
  .post("/room", validateToken, roomController.create)
  .post("/bulk-import", validateToken, roomController.bulkImport)
  .post("/room/get-secondary-users/:id", validateToken, roomController.getSecondaryUsers)
  .post("/room/validate-room/:id", validateToken, roomController.validateRoom)
  .put("/room/:id", validateToken, roomController.update)
  .get("/room", validateToken, roomController.getAll)
  .get("/room/get-room-list", validateToken, roomController.getRoomList)
  .get("/room/get-occupied-room-list", validateToken, roomController.getOccupiedRoomList)
  .get("/room/get-available-room-list", validateToken, roomController.getAvailableRoomList)
  .get("/room/:id", validateToken, roomController.getById)
  .get("/room/check-in/all-list", validateToken, roomController.getCheckInList)
  .delete("/room/:id", validateToken, roomController.deleteById);

router.get("/room/getDocumentDetailsById/:id", validateToken, roomController.getDocumentDetailsById);
router.get("/room/getDocumentDetailsByRoomId/:id", validateToken, roomController.getDocumentDetailsRoomById);
router.post("/room/change-room", validateToken, roomController.changeRooms);
router.post("/room/update-checkout", validateToken, roomController.updateCheckout);

//dashboard
router
  .get("/dashboard/get-counts", validateToken, roomController.getRoomCounts)
  .get("/dashboard/get-property-list", validateToken, roomController.getPropertyList)
  .post("/dashboard/get-inhouse-data", validateToken, documentController.getInHouseData)
  .post("/dashboard/get-weekly-data", validateToken, documentController.getWeeklyData);

// reports
router.post("/report/check-in", validateToken, reportController.checkIn)
  .post("/report/check-out", validateToken, reportController.checkOut)
  .post("/report/in-house", validateToken, reportController.inHouse)
  .post("/report/monthly", validateToken, reportController.monthly)
  .post("/report/nationality", validateToken, reportController.nationality)
  .post("/report/processed-record", validateToken, reportController.processedRecord)
  .post("/report/room-change", validateToken, reportController.roomChange);

// export
router.get("/export/excel/check-in", exportController.checkInExcel)
  .get("/export/pdf/check-in", exportController.checkInPdf)

  .get("/export/excel/check-out", exportController.checkOutExcel)
  .get("/export/pdf/check-out", exportController.checkOutPdf)

  .get("/export/excel/in-house", exportController.inHouseExcel)
  .get("/export/pdf/in-house", exportController.inHousePdf)

  .get("/export/excel/monthly", exportController.monthlyExcel)
  .get("/export/pdf/monthly", exportController.monthlyPdf)

  .get("/export/excel/nationality", exportController.nationalityExcel)
  .get("/export/pdf/nationality", exportController.nationalityPdf)

  .get("/export/excel/processed-record", exportController.processedRecordExcel)
  .get("/export/pdf/processed-record", exportController.processedRecordPdf)

  .get("/export/excel/room-change", exportController.roomChangeExcel)
  .get("/export/pdf/room-change", exportController.roomChangePdf)

  .get("/export/dashboard/excel/weekly-check-in", validateTokenGet, exportController.dashboardWeeklyCheckinExcel)
  .get("/export/dashboard/pdf/weekly-check-in", validateTokenGet, exportController.dashboardWeeklyCheckinPdf)

  .get("/export/dashboard/excel/in-house", validateTokenGet, exportController.dashboardInHouseExcel)
  .get("/export/dashboard/pdf/in-house", validateTokenGet, exportController.dashboardInHousePdf);

// get default drop down list
router.get('/get-drop-down-list', validateToken, documentController.getDropDownList);

// get property details
router.get('/get-user-property', validateToken, propertyController.getUserPropertyById);

// validate
router.post(
  "/validate/email",
  validateToken,
  userManagementController.validateEmail
);

// settings
router
  .get(
    "/setting",
    validateToken,
    settingController.getSetting
  )
  .put(
    "/setting",
    validateToken,
    settingController.update
  );

// get restore data
router.get("/get-destination-data", validateToken, documentController.getDestinationData);
router.get("/get-destination-url", validateToken, documentController.getDestinationUrl);
router.get("/data-submit-completed/:id", validateToken, documentController.submitDataCompleted);
router.post("/set-application-id", validateToken, documentController.setApplicationID);

// swagger document
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocument));

//export modules
module.exports = router;
