/*
 * Author: Jayamurugan
 * Descripton:
 */

// import the plugins

// user model schema
const reportModel = require("../models/report");
const responseSend = require("../config/response");
const { perPage } = require('../config/config');
const excel = require('node-excel-export')
const fs = require('fs');
const moment = require('moment');
const constant = require('../config/constant');
//Required package
var pdf = require("pdf-creator-node");
const data = require("../config/data");

const styles = {
  headerDark: {
    fill: {
      fgColor: {
        rgb: 'FF000000'
      }
    },
    font: {
      color: {
        rgb: 'FFFFFFFF'
      },
      sz: 14,
      bold: true,
      underline: true
    }
  },
  cellPink: {
    fill: {
      fgColor: {
        rgb: 'FFFFCCFF'
      }
    }
  },
  cellGreen: {
    fill: {
      fgColor: {
        rgb: 'FF00FF00'
      }
    }
  }
};

// export the user controller functions
module.exports = {
  checkInExcel: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getCheckInDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          const specification = {
            family_name: {
              displayName: 'Family name',
              headerStyle: styles.headerDark,
              width: 150
            },
            given_name: {
              displayName: 'Given name',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_number: {
              displayName: 'Document number',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_type: {
              displayName: 'Document type',
              headerStyle: styles.headerDark,
              width: 150
            }, issue_date: {
              displayName: 'Issue date',
              headerStyle: styles.headerDark,
              width: 150
            },
            expiry_date: {
              displayName: 'Expiry date',
              headerStyle: styles.headerDark,
              width: 150
            },
            check_in_date: {
              displayName: 'Check in date',
              headerStyle: styles.headerDark,
              width: 150
            }
          }
          const dataset = [];
          if (response.res.length > 0) {
            for (let row of response.res) {
              dataset.push({
                family_name: row.family_name,
                given_name: row.given_name,
                document_number: row.passport_number,
                document_type: row.document_type,
                issue_date: row.issue_date,
                expiry_date: row.valid_date,
                check_in_date: row.document_check_in_date
              });
            }
          }

          const report = excel.buildExport(
            [
              {
                name: 'Report check in',
                specification: specification,
                data: dataset
              }
            ]
          );
          res.attachment('report-check-in.xlsx');
          return res.send(report);
        }
      }
    );
  }, checkInPdf: function (req, res) {

    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getCheckInDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          var options = {
            format: "A4",
            orientation: "landscape",
            border: "10mm"
          };

          var document = {
            html: `<!DOCTYPE html>
                <html>
                  <head>
                    <mate charest="utf-8" />
                    <title>Report check in</title>
                    <style>
                    table, td, th {
                      border: 1px solid black;
                    }
                    table td, table th{
                      padding:5px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    </style>
                  </head>
                  <body>
                    <table>
                    <thead>
                      <tr>
                        <th>Family name</th>
                        <th>Given name</th>
                        <th>Document number</th>
                        <th>Documeny type</th>
                        <th style="width:80px">Issue date</th>
                        <th style="width:80px">Expiry date</th>
                        <th style="width:80px">Check in date</th>
                      </tr>
                      <tbody>
                      {{#each data}}
                        <tr>
                        <td>{{this.family_name}}</td>
                        <td>{{this.given_name}}</td>
                        <td>{{this.passport_number}}</td>
                        <td>{{this.document_type}}</td>
                        <td>{{this.issue_date}}</td>
                        <td>{{this.valid_date}}</td>
                        <td>{{this.document_check_in_date}}</td>
                        </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </body>
                </html>`,
            data: {
              data: response.res,
            },
            path: `./uploads/report_check_in_${moment().format('YYYYMMDDHim')}.pdf`,
            type: "",
          }
          pdf
            .create(document, options)
            .then((result) => {
              console.log(result);
              res.download(result.filename);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  },

  checkOutExcel: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getCheckOutDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          const specification = {
            family_name: {
              displayName: 'Family name',
              headerStyle: styles.headerDark,
              width: 150
            },
            given_name: {
              displayName: 'Given name',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_number: {
              displayName: 'Document number',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_type: {
              displayName: 'Document type',
              headerStyle: styles.headerDark,
              width: 150
            }, issue_date: {
              displayName: 'Issue date',
              headerStyle: styles.headerDark,
              width: 150
            },
            expiry_date: {
              displayName: 'Expiry date',
              headerStyle: styles.headerDark,
              width: 150
            },
            check_in_date: {
              displayName: 'Checkout date',
              headerStyle: styles.headerDark,
              width: 150
            }
          }
          const dataset = [];
          if (response.res.length > 0) {
            for (let row of response.res) {
              dataset.push({
                family_name: row.family_name,
                given_name: row.given_name,
                document_number: row.passport_number,
                document_type: row.document_type,
                issue_date: row.issue_date,
                expiry_date: row.valid_date,
                check_in_date: row.document_check_out_date,
              });
            }
          }

          const report = excel.buildExport(
            [
              {
                name: 'Report checkout',
                specification: specification,
                data: dataset
              }
            ]
          );
          res.attachment('report-check-out.xlsx');
          return res.send(report);
        }
      }
    );
  }, checkOutPdf: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getCheckOutDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          var options = {
            format: "A4",
            orientation: "landscape",
            border: "10mm"
          };

          var document = {
            html: `<!DOCTYPE html>
                <html>
                  <head>
                    <mate charest="utf-8" />
                    <title>Report checkout</title>
                    <style>
                    table, td, th {
                      border: 1px solid black;
                    }
                    table td, table th{
                      padding:5px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    </style>
                  </head>
                  <body>
                    <table>
                    <thead>
                      <tr>
                        <th>Family name</th>
                        <th>Given name</th>
                        <th>Document number</th>
                        <th>Documeny type</th>
                        <th style="width:80px">Issue date</th>
                        <th style="width:80px">Expiry date</th>
                        <th style="width:80px">Checkout date</th>
                      </tr>
                      <tbody>
                      {{#each data}}
                        <tr>
                        <td>{{this.family_name}}</td>
                        <td>{{this.given_name}}</td>
                        <td>{{this.passport_number}}</td>
                        <td>{{this.document_type}}</td>
                        <td>{{this.issue_date}}</td>
                        <td>{{this.valid_date}}</td>
                        <td>{{this.document_check_out_date}}</td>
                        </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </body>
                </html>`,
            data: {
              data: response.res,
            },
            path: `./uploads/report_check_out_${moment().format('YYYYMMDDHim')}.pdf`,
            type: "",
          }
          pdf
            .create(document, options)
            .then((result) => {
              console.log(result);
              res.download(result.filename);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  },
  inHouseExcel: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate
    }
    reportModel.getInHouseDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          const specification = {
            family_name: {
              displayName: 'Family name',
              headerStyle: styles.headerDark,
              width: 150
            },
            given_name: {
              displayName: 'Given name',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_number: {
              displayName: 'Document number',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_type: {
              displayName: 'Document type',
              headerStyle: styles.headerDark,
              width: 150
            }, issue_date: {
              displayName: 'Issue date',
              headerStyle: styles.headerDark,
              width: 150
            },
            expiry_date: {
              displayName: 'Expiry date',
              headerStyle: styles.headerDark,
              width: 150
            },
            check_in_date: {
              displayName: 'Check in date',
              headerStyle: styles.headerDark,
              width: 150
            }
          }
          const dataset = [];
          if (response.res.length > 0) {
            for (let row of response.res) {
              dataset.push({
                family_name: row.family_name,
                given_name: row.given_name,
                document_number: row.document_number,
                document_type: row.document_type,
                issue_date: row.issue_date,
                expiry_date: row.valid_date,
                check_in_date: row.document_check_in_date,
              });
            }
          }

          const report = excel.buildExport(
            [
              {
                name: 'Report in-house',
                specification: specification,
                data: dataset
              }
            ]
          );
          res.attachment('report-check-in.xlsx');
          return res.send(report);
        }
      }
    );
  }, inHousePdf: function (req, res) {

    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate
    }
    reportModel.getInHouseDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          var options = {
            format: "A4",
            orientation: "landscape",
            border: "10mm"
          };

          var document = {
            html: `<!DOCTYPE html>
                <html>
                  <head>
                    <mate charest="utf-8" />
                    <title>Report in-house</title>
                    <style>
                    table, td, th {
                      border: 1px solid black;
                    }
                    table td, table th{
                      padding:5px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    </style>
                  </head>
                  <body>
                    <table>
                    <thead>
                      <tr>
                        <th>Family name</th>
                        <th>Given name</th>
                        <th>Document number</th>
                        <th>Documeny type</th>
                        <th style="width:80px">Issue date</th>
                        <th style="width:80px">Expiry date</th>
                        <th style="width:80px">Check in date</th>
                      </tr>
                      <tbody>
                      {{#each data}}
                        <tr>
                        <td>{{this.family_name}}</td>
                        <td>{{this.given_name}}</td>
                        <td>{{this.document_number}}</td>
                        <td>{{this.document_type}}</td>
                        <td>{{this.issue_date}}</td>
                        <td>{{this.valid_date}}</td>
                        <td>{{this.document_check_in_date}}</td>
                        </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </body>
                </html>`,
            data: {
              data: response.res,
            },
            path: `./uploads/report_in_house_${moment().format('YYYYMMDDHim')}.pdf`,
            type: "",
          }
          pdf
            .create(document, options)
            .then((result) => {
              console.log(result);
              res.download(result.filename);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  },
  monthlyExcel: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getMonthlyDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          const specification = {
            date: {
              displayName: 'Date',
              headerStyle: styles.headerDark,
              width: 150
            },
            check_in_count: {
              displayName: 'Check-in count',
              headerStyle: styles.headerDark,
              width: 150
            },
            checkout_count: {
              displayName: 'Checkout count',
              headerStyle: styles.headerDark,
              width: 150
            },
            room_change_count: {
              displayName: 'Room change count',
              headerStyle: styles.headerDark,
              width: 150
            }
          }
          const dataset = [];
         
          if ((response.removedKeyArray).length > 0) {
            for (let row of response.removedKeyArray) {
             dataset.push({
                date: row.date,
                check_in_count: row.check_in_count,
                checkout_count: row.check_out_count,
                room_change_count: row.room_change_count
              });
            }
          }

          const report = excel.buildExport(
            [
              {
                name: 'Montyly',
                specification: specification,
                data: dataset
              }
            ]
          );
          res.attachment('report-monthly.xlsx');
          return res.send(report);
        }
      }
    );
  }, monthlyPdf: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getMonthlyDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          var options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm"
          };

          var document = {
            html: `<!DOCTYPE html>
                <html>
                  <head>
                    <mate charest="utf-8" />
                    <title>Report in-house</title>
                    <style>
                    table, td, th {
                      border: 1px solid black;
                    }
                    table td, table th{
                      padding:5px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    </style>
                  </head>
                  <body>
                    <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check-in count</th>
                        <th>Checkout count</th>
                        <th>Room change count</th>
                      </tr>
                      <tbody>
                      {{#each data}}
                        <tr>
                        <td>{{this.date}}</td>
                        <td>{{this.check_in_count}}</td>
                        <td>{{this.check_out_count}}</td>
                        <td>{{this.room_change_count}}</td>
                        </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </body>
                </html>`,
            data: {
              data: response.removedKeyArray,
            },
            path: `./uploads/report_monthly_${moment().format('YYYYMMDDHim')}.pdf`,
            type: "",
          }
          pdf
            .create(document, options)
            .then((result) => {
              console.log(result);
              res.download(result.filename);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  },
  nationalityExcel: function (req, res) {

  }, nationalityPdf: function (req, res) {

  },
  processedRecordExcel: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getProcessedRecordDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          const specification = {
            family_name: {
              displayName: 'Family name',
              headerStyle: styles.headerDark,
              width: 150
            },
            given_name: {
              displayName: 'Given name',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_number: {
              displayName: 'Document number',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_type: {
              displayName: 'Document type',
              headerStyle: styles.headerDark,
              width: 150
            }, issue_date: {
              displayName: 'Issue date',
              headerStyle: styles.headerDark,
              width: 150
            },
            expiry_date: {
              displayName: 'Expiry date',
              headerStyle: styles.headerDark,
              width: 150
            },
            check_in_date: {
              displayName: 'Check-in date',
              headerStyle: styles.headerDark,
              width: 150
            },
            check_out_date: {
              displayName: 'Checkout date',
              headerStyle: styles.headerDark,
              width: 150
            }
          }
          const dataset = [];
          if (response.res.length > 0) {
            for (let row of response.res) {
              dataset.push({
                family_name: row.family_name,
                given_name: row.given_name,
                document_number: row.c_form_no,
                document_type: row.document_type,
                issue_date: row.issue_date,
                expiry_date: row.valid_date,
                check_in_date: row.document_check_in_date,
                check_out_date: row.document_check_out_date
              });
            }
          }

          const report = excel.buildExport(
            [
              {
                name: 'Processed',
                specification: specification,
                data: dataset
              }
            ]
          );
          res.attachment('report-processed-record.xlsx');
          return res.send(report);
        }
      }
    );
  }, processedRecordPdf: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getProcessedRecordDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          var options = {
            format: "A4",
            orientation: "landscape",
            border: "10mm"
          };

          var document = {
            html: `<!DOCTYPE html>
                <html>
                  <head>
                    <mate charest="utf-8" />
                    <title>Report check in</title>
                    <style>
                    table, td, th {
                      border: 1px solid black;
                    }
                    table td, table th{
                      padding:5px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    </style>
                  </head>
                  <body>
                    <table>
                    <thead>
                      <tr>
                        <th>Family name</th>
                        <th>Given name</th>
                        <th>Document number</th>
                        <th>Documeny type</th>
                        <th style="width:80px">Issue date</th>
                        <th style="width:80px">Expiry date</th>
                        <th style="width:80px">Check-in date</th>
                        <th style="width:80px">Checkout date</th>
                      </tr>
                      <tbody>
                      {{#each data}}
                        <tr>
                        <td>{{this.family_name}}</td>
                        <td>{{this.given_name}}</td>
                        <td>{{this.c_form_no}}</td>
                        <td>{{this.document_type}}</td>
                        <td>{{this.issue_date}}</td>
                        <td>{{this.valid_date}}</td>
                        <td>{{this.document_check_in_date}}</td>
                        <td>{{this.document_check_out_date}}</td>
                        </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </body>
                </html>`,
            data: {
              data: response.res,
            },
            path: `./uploads/report_processed_${moment().format('YYYYMMDDHim')}.pdf`,
            type: "",
          }
          pdf
            .create(document, options)
            .then((result) => {
              console.log(result);
              res.download(result.filename);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  },
  roomChangeExcel: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getRoomChangeDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          const specification = {
            family_name: {
              displayName: 'Family name',
              headerStyle: styles.headerDark,
              width: 150
            },
            given_name: {
              displayName: 'Given name',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_number: {
              displayName: 'Document number',
              headerStyle: styles.headerDark,
              width: 150
            },
            document_type: {
              displayName: 'Document type',
              headerStyle: styles.headerDark,
              width: 150
            }, issue_date: {
              displayName: 'Issue date',
              headerStyle: styles.headerDark,
              width: 150
            },
            expiry_date: {
              displayName: 'Expiry date',
              headerStyle: styles.headerDark,
              width: 150
            },
            check_in_date: {
              displayName: 'Check-in date',
              headerStyle: styles.headerDark,
              width: 150
            },
            check_out_date: {
              displayName: 'Checkout date',
              headerStyle: styles.headerDark,
              width: 150
            },room_change_date: {
              displayName: 'Room change date',
              headerStyle: styles.headerDark,
              width: 150
            },from_room: {
              displayName: 'From room',
              headerStyle: styles.headerDark,
              width: 150
            },to_room: {
              displayName: 'To room',
              headerStyle: styles.headerDark,
              width: 150
            }
          }
          const dataset = [];
          if (response.res.length > 0) {
            for (let row of response.res) {
              dataset.push({
                family_name: row.family_name,
                given_name: row.given_name,
                document_number: row.passport_number,
                document_type: row.document_type,
                issue_date: row.issue_date,
                expiry_date: row.valid_date,
                check_in_date: row.document_check_in_date,
                check_out_date: row.document_check_out_date,
                room_change_date: row.document_check_in_date,
                from_room: row.from_room,
                to_room: row.to_room,
              });
            }
          }

          const report = excel.buildExport(
            [
              {
                name: 'Room changed',
                specification: specification,
                data: dataset
              }
            ]
          );
          res.attachment('report-room-change.xlsx');
          return res.send(report);
        }
      }
    );
  }, roomChangePdf: function (req, res) {
    let reqData = {
      propertyId: req.query.property,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getRoomChangeDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          var options = {
            format: "A3",
            orientation: "landscape",
            border: "10mm"
          };

          var document = {
            html: `<!DOCTYPE html>
                <html>
                  <head>
                    <mate charest="utf-8" />
                    <title>Report check in</title>
                    <style>
                    table, td, th {
                      border: 1px solid black;
                    }
                    table td, table th{
                      padding:5px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    </style>
                  </head>
                  <body>
                    <table>
                    <thead>
                      <tr>
                        <th>Family name</th>
                        <th>Given name</th>
                        <th>Document number</th>
                        <th>Documeny type</th>
                        <th style="width:80px">Issue date</th>
                        <th style="width:80px">Expiry date</th>
                        <th style="width:80px">Check-in date</th>
                        <th style="width:80px">Checkout date</th>
                        <th style="width:80px">Room change date</th>
                        <th style="width:80px">From room</th>
                        <th style="width:80px">To room</th>
                      </tr>
                      <tbody>
                      {{#each data}}
                        <tr>
                        <td>{{this.family_name}}</td>
                        <td>{{this.given_name}}</td>
                        <td>{{this.passport_number}}</td>
                        <td>{{this.document_type}}</td>
                        <td>{{this.issue_date}}</td>
                        <td>{{this.valid_date}}</td>
                        <td>{{this.document_check_in_date}}</td>
                        <td>{{this.document_check_out_date}}</td>
                        <td>{{this.document_check_in_date}}</td>
                        <td>{{this.from_room}}</td>
                        <td>{{this.to_room}}</td>
                        </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </body>
                </html>`,
            data: {
              data: response.res,
            },
            path: `./uploads/report_room_change_${moment().format('YYYYMMDDHim')}.pdf`,
            type: "",
          }
          pdf
            .create(document, options)
            .then((result) => {
              res.download(result.filename);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  },

  dashboardWeeklyCheckinExcel: function (req, res) {
    let propertyId =req.userDetails.user_type ===constant.USER_TYPE.ADMIN ? req.query.property_id:req.userDetails.property_id;
    let reqData = {
      propertyId: propertyId,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }

    reportModel.dashboardWeeklyCheckinDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          const specification = {
            count: {
              displayName: 'Number of CheckIn',
              headerStyle: styles.headerDark,
              width: 200 
            },
            check_in_date: {
              displayName: 'Check in date',
              headerStyle: styles.headerDark,
              width: 200 
            }
          }
          const dataset = [];
          if (response.res.length > 0) {
            for (let row of response.res) {
              dataset.push({
                count: row.data_count,
                 check_in_date: row.check_in_date,
              });
            }
          }

          const report = excel.buildExport(
            [
              {
                name: 'Report check in',
                specification: specification,
                data: dataset
              }
            ]
          );
          res.attachment('last-week-check-in-report.xlsx');
          return res.send(report);
        }
      }
    );
  }, dashboardWeeklyCheckinPdf: function (req, res) {
    let propertyId =req.userDetails.user_type ===constant.USER_TYPE.ADMIN ? req.query.property_id:req.userDetails.property_id;
    let reqData = {
      propertyId: propertyId,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.dashboardWeeklyCheckinDataExport(
      reqData, function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          var options = {
            format: "A4",
            orientation: "landscape",
            border: "10mm"
          };

          var document = {
            html: `<!DOCTYPE html>
                <html>
                  <head>
                    <mate charest="utf-8" />
                    <title>Report check in</title>
                    <style>
                    table, td, th {
                      border: 1px solid black;
                    }
                    table td, table th{
                      padding:5px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    </style>
                  </head>
                  <body>
                    <table>
                    <thead>
                      <tr>
                        <th>Number of CheckIn</th>
                        <th>CheckIn Date</th>
                      </tr>
                      <tbody>
                      {{#each data}}
                        <tr>
                        <td>{{this.data_count}}</td>
                        <td>{{this.check_in_date}}</td>
                        </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </body>
                </html>`,
            data: {
              data: response.res,
            },
            path: `./uploads/last-week-check-in-report_${moment().format('YYYYMMDDHim')}.pdf`,
            type: "",
          }
          pdf
            .create(document, options)
            .then((result) => {
              console.log(result);
              res.download(result.filename);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
  },

  dashboardInHouseExcel: function (req, res) {
    let propertyId =req.userDetails.user_type ===constant.USER_TYPE.ADMIN ? req.query.property_id:req.userDetails.property_id;
    let reqData = {
      propertyId: propertyId,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }

    reportModel.getDashboardInHouseData(reqData, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        const specification = {
          country: {
            displayName: 'Country',
            headerStyle: styles.headerDark,
            width: 120 
          },
          count: {
            displayName: 'Count',
            headerStyle: styles.headerDark,
            width: 120 
          }
        }
        const dataset = [];
        
        if (response.res.length > 0) {
          for (let row of response.res) {
            dataset.push({
              country: row.name,
              count: row.data_count
            });
          }
        }

        const report = excel.buildExport(
          [
            {
              name: 'Dashboard in house report',
              specification: specification,
              data: dataset
            }
          ]
        );
        res.attachment('dashboard-in-house-report.xlsx');
        return res.send(report);
      }
    }
    );
  }, dashboardInHousePdf: function (req, res) {
    let propertyId =req.userDetails.user_type ===constant.USER_TYPE.ADMIN ? req.query.property_id:req.userDetails.property_id;
    let reqData = {
      propertyId:propertyId,
      fromDate: req.query.fromDate,
      endDate: req.query.endDate
    }
    reportModel.getDashboardInHouseData(reqData, function (err, response) {
     
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        var options = {
          format: "A4",
          orientation: "portrait",
          border: "10mm"
        };

        var document = {
          html: `<!DOCTYPE html>
                <html>
                  <head>
                    <mate charest="utf-8" />
                    <title>Report check in</title>
                    <style>
                    table, td, th {
                      border: 1px solid black;
                    }
                    table td, table th{
                      padding:5px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    </style>
                  </head>
                  <body>
                    <table>
                    <thead>
                      <tr>
                        <th>Country</th>
                        <th>Count</th>
                      </tr>
                      <tbody>
                      {{#each data}}
                        <tr>
                        <td>{{this.name}}</td>
                        <td>{{this.data_count}}</td>
                        </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </body>
                </html>`,
          data: {
            data: response.res,
          },
          path: `./uploads/dashboard-in-house-report_${moment().format('YYYYMMDDHim')}.pdf`,
          type: "",
        }
        pdf
          .create(document, options)
          .then((result) => {
            console.log(result);
            res.download(result.filename);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  },

};
