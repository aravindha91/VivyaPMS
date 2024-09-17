/*
Author: Jayamurugan
Description: public route
Routes: sign-out, login, session-chcek, c-form, upload-file, nanonets, import-data
*/

var express = require("express");

var router = express.Router();

var dotenv = require("dotenv");
dotenv.config();
var baseUrl = process.env.BASE_URL;

router.get("/", function (req, res, next) {
  res.render("pages/login", { title: "Login", baseUrl: baseUrl });
});

router.get("/sign-out", function (req, res) {
  req.session.destroy();
  res.redirect(baseUrl);
});
router.get("/session-check", function (req, response) {
  response
    .writeHead(200, { "Content-Type": "text/plain" })
    .end(req.session.userDetails);
});
router.get("/c-form", function (req, res, next) {
  res.render("pages/c-form", { title: "c form", baseUrl: baseUrl });
});
router.get('/upload-file', async function (req, response) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(__dirname + '/../uploads/passport-3.jpeg'));
  const res = await axios.post('http://localhost:5000/upload', formData, {
    // You need to use `getHeaders()` in Node.js because Axios doesn't
    // automatically set the multipart form boundary in Node.
    headers: formData.getHeaders()
  });

  req.end();
});
router.get('/nanonet', function (req, res, next) {
  res.render("pages/nanonet", { title: "Nanonet", baseUrl: baseUrl });
}).post('/nanonet', async function (req, res) {
  var request = require('request');   // install request module by - 'npm install request'
  var querystring = require('querystring');
  var path = require('path');
  let scanDocument;
  let uploadPath;
  let fileName;
  let baseName;

  let dir = `./uploads/`;

  scanDocument = req.files["file"];
  let _ext = req.body.blob === "yes" ? "png" : path.extname(scanDocument.name).substr(1);
  baseName = "file_" + Math.floor(Math.random() * 1000000000) + Date.now();
  fileName = baseName + "." + _ext;
  uploadPath = dir + fileName;

  // Use the mv() method to place the file somewhere on your server
  await scanDocument.mv(uploadPath, function (err) {
    if (err) {
      res.status(500);
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "*");
      res.header("Access-Control-Allow-Headers", "*");
      var response = {
        msg: 'Internal server error'
      };
      res.json(response);

      return;
    }
    // const form_data = {
    //   'urls': 'http://localhost:3000/uploads/' + fileName
    // }
    var options = {
      'method': 'POST',
      'url': 'https://app.nanonets.com/api/v2/OCR/Model/dad40631-7c22-4938-a6ec-458b585896ff/LabelUrls/',
      'headers': {
        'accept': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic UzRxSGNhOFNUa2xiZ3A4RXJSNjJTMXFYOURXeEtpNm06',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        'urls': 'https://rayi.in/01.jpg'
      }
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });

  });
});
router.get('/import-data', async function (req, res) {
  // let sql = require('../config/db');
  // let data = require('../config/data');
  // let table = require('../config/tables');
  // console.log(data.purpost_to_visit);
  // let query = 'INSERT INTO `' + table.purposeToVisit + '` (`visit_id`,`name`) VALUES(?,?)';
  // for await (let i of data.purpost_to_visit) {
  //   try {
  //     await sql.query(query, [i.value,i.text]);

  //   } catch (error) {
  //     console.log(error);

  //   }
  // }
  res.json({ status: true })
});
router.get('/test-image', async function (req, response) {

  const { res } = require('../config/response');
  let details = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let result = [];

  getOcrData(11);

  res(response, 200, true, {
    ocr: result
  });
});
module.exports = router;
async function getOcrData(filename) {
  const FormData = require("form-data");
  const moment = require('moment');
  const fs = require("fs");
  const axios = require("axios");


  const formData = new FormData();
  formData.append(
    "file",
    fs.createReadStream(__dirname + "/../test-image/" + filename + '.jpg')
  );
  let result = { status: false, id: filename };

  const ocrResponse = await axios
    .post(process.env.UPLOAD_OCR, formData, {
      headers: formData.getHeaders(),
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log("Error from get ocr =>", error.response);
    });

  if (typeof ocrResponse !== 'undefined' && ocrResponse.status == 200) {
    result.ocrData = ocrResponse.data;
    result.documentType = 'passport';
    result.status = true;
  }
  console.log('response => ', moment().format("HH:mm:ss"));
  console.log(result);

}
