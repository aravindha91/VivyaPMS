/*
 * Author: Jayamurugan
 * Descripton: password details
 */

// import the plugins

// user model schema
const documentDetailsModel = require("../models/documentDetails");
const responseSend = require("../config/response");
const { perPage, homePath } = require("../config/config");
const path = require("path");
const _ = require("lodash");
const FormData = require("form-data");
//const axios = require("axios");
const axios = require('axios').default;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require("fs");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const constant = require("../config/constant");
const { convert } = require("../utility/convert");
const { json } = require("body-parser");
const pool = require('../config/db');
const https = require("https");

dotenv.config();
// export the user controller functions
module.exports = {
  // create group details
  // create user
  create: async function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    var _profile = "";
    if (bodyParams["profile-photo"] !== "") {
      _profile = await uploadProfile(request, res);
    }

    bodyParams.profilePhoto = _profile;

    documentDetailsModel.create(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  createGuest: async function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    var _profile = "";
    if (bodyParams["profile-photo"] !== "") {
      _profile = await uploadProfile(request, res);
    }

    bodyParams.profilePhoto = _profile;
    bodyParams.primaryDocId = request.params.id;
    documentDetailsModel.createGuest(bodyParams, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  update: async function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    var _profile = "";
    if (bodyParams["profile-photo"] !== "") {
      _profile = await uploadProfile(request, res);
    }

    bodyParams.profilePhoto = _profile;
    documentDetailsModel.update(
      request.params.id,
      bodyParams,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  updateReporcess: async function (request, res) {
    var bodyParams = request.body;
    bodyParams.userDetails = request.userDetails;
    var _profile = "";
    if (bodyParams["profile-photo"] !== "") {
      _profile = await uploadProfile(request, res);
    }

    bodyParams.profilePhoto = _profile;
    documentDetailsModel.updateReporcess(
      request.params.id,
      bodyParams,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  getAll: function (req, res) {
	let userDetails = req.userDetails;
    let page = req.query.page ? req.query.page : 1;
    let search = req.query.search ? decodeURI(req.query.search) : false;
    let noOfRecordsPerPage = parseInt(req.query["total-page"]);
    let offset = (page - 1) * noOfRecordsPerPage;
    let filterOption = req.query["fileter-option"];
    documentDetailsModel.getAll(
      offset,
      noOfRecordsPerPage,
      search,
      userDetails,
      filterOption,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          response.page = page;
          response.offset = offset;
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  getById: function (req, res) {
    documentDetailsModel.getById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  viewDocumentById: function (req, res) {
    documentDetailsModel.viewDocumentById(
      req.params.id,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  moveToFile: function (req, res) {
    documentDetailsModel.moveToFile(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  getDropDownList: function (req, res) {
    documentDetailsModel.getDropDownList(req, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  deleteById: function (req, res) {
    documentDetailsModel.deleteById(req.params.id, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  }, // upload document

  // uploadDocument: async function (req, res) {
  //   let body = req.body;
  //   let scanDocument;
  //   let uploadPath;
  //   let fileType;
  //   let fileName;
  //   let getOcr;
  //   let baseName;
  //   let thumbName;
  //   let dir = `./uploads/`;
    

    
  //   scanDocument = req.files["scan-document"];
  //   type = req.body.type;

  //   let _ext =
  //       body.blob === "yes" ? "png" : path.extname(scanDocument.name).substr(1);

  //   // Use current local timestamp for unique file name
  //   let timestamp = new Date().toLocaleString().replace(/[\/\s,:]/g, ''); // Format: YYYYMMDDHHMMSS
  //   baseName = "file_" + timestamp;
  //   fileName = baseName + "." + _ext;
  //   thumbName = baseName + "_thumb.jpg";

  //   uploadPath = dir + fileName;

  //   // Use the mv() method to place the file somewhere on your server
  //   await scanDocument.mv(uploadPath, async function (err) {
  //       if (err) {
  //           responseSend.res(res, 500, false, { msg: "Internal server error" });
  //       }

  //   // Rest of the code remains unchanged
  //     // await sleep(5000);
  //     // convert the image and pdf thumbnail
  //     let source = homePath + "uploads/" + fileName;
  //     let destination = homePath + "uploads/" + thumbName;
  //   // await convert(source, destination, _ext, async function (convertRes) {
  //    switch (type) {
  //     case "passport":
  //        getOcr = await getOcrDataFromNanonet(fileName);
  //       break;
  //     case "visa":
  //       getOcr = await getOcrDataFromVisa(fileName);
  //         break;
  //    }
           
  //        //  console.log("respvvvvvvv",getOcr)
  //         responseSend.res(res, 200, true,{
  //           filePath: dir,
  //           fileName: fileName,
  //           fileType: fileType,
  //           file: uploadPath,
  //           ext: _ext,
  //           ind: body.ind,
  //       //  genThumbnail: convertRes.status,
  //           thumbnail: thumbName,
  //           ocr: getOcr,
  //         });   
  //     });
     
  //  // });
  // },


  uploadDocument: async function (req, res) {
    let body = req.body;
    let scanDocument;
    let uploadPath;
    let fileType;
    let fileName;
    let getOcr;
    let baseName;
    let thumbName;
    let dir = `./uploads/`;
   
 
   
    scanDocument = req.files["scan-document"];
   
    type = req.body.type;
 
    let _ext =
        body.blob === "yes" ? "png" : path.extname(scanDocument.name).substr(1);
 
    // Use current local timestamp for unique file name
    let timestamp = new Date().toLocaleString().replace(/[\/\s,:]/g, ''); // Format: YYYYMMDDHHMMSS
    baseName = "file_" + timestamp;
    fileName = baseName + "." + _ext;
    thumbName = baseName + "_thumb.jpg";
 
    uploadPath = dir + fileName;
 
    // Use the mv() method to place the file somewhere on your server
    await scanDocument.mv(uploadPath, async function (err) {
        if (err) {
            responseSend.res(res, 500, false, { msg: "Internal server error" });
        }
 
    // Rest of the code remains unchanged
      // await sleep(5000);
      // convert the image and pdf thumbnail
      let source = homePath + "uploads/" + fileName;
      let destination = homePath + "uploads/" + thumbName;
    // await convert(source, destination, _ext, async function (convertRes) {
    //  switch (type) {
    //   case "passport":
    //      getOcr = await getOcrDataFromNanonet(fileName);
    //     break;
    //   case "visa":
    //     getOcr = await getOcrDataFromVisa(fileName);
    //       break;
    //  }
           
         //  console.log("respvvvvvvv",getOcr)
          responseSend.res(res, 200, true,{
            filePath: dir,
            fileName: fileName,
            fileType: fileType,
            file: uploadPath,
            ext: _ext,
            ind: body.ind,
        //  genThumbnail: convertRes.status,
            thumbnail: thumbName,
            // ocr: getOcr,
          });  
      });
     
   // });
  },



  deleteDocument: function (req, res) {
    let body = req.body;
    fs.unlink(homePath + "uploads/" + body.fileName, function (err, rs) {
      if (err) {
        console.log(err);
        responseSend.res(res, 200, false, {
          inx: body.inx,
          msg: "Unable to delete the document, please try again",
        });
        return;
      }
      fs.unlink(homePath + "uploads/" + body.thumbnail, function (err, rs) {});
      responseSend.res(res, 200, true, {
        inx: body.inx,
        msg: "Successfully deleted",
      });
    });
  },
  getOcr: async function (req, res) {
    let result = [];
    let files = JSON.parse(req.body.attachments);
    if (files.length === 0) {
      responseSend.res(res, 200, false, { msg: "There is no attachement" });
      return;
    }
    for (let i = 0; i < files.length; i++) {
      if (typeof files[i].deleted === "undefined") {
        result.push(await getOcrData(files[i].fileName, files[i].thumbnail));
      }
    }
    responseSend.res(res, 200, true, { data: result });
  },
  getDestinationData: async function (req, res) {
    let userDetails = req.userDetails;
   // console.log("1111111111",user)
    if (typeof userDetails === "undefined") {
      responseSend.res(res, 200, false, {
        msg: "Please login your account again, your login session expired",
      });
      return;
    }
    documentDetailsModel.getDestinationData(
      userDetails,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  getDestinationUrl: async function (req, res) {
    let userDetails = req.userDetails;
    if (typeof userDetails === "undefined") {
      responseSend.res(res, 200, false, {
        msg: "Please login your account again, your login session expired",
      });
      return;
    }
    documentDetailsModel.getDestinationUrl(
      userDetails,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },
  submitDataCompleted: async function (req, res) {
    let userDetails = req.userDetails;
    if (typeof userDetails === "undefined") {
      responseSend.res(res, 200, false, {
        msg: "Please login your account again, your session token expired",
      });
      return;
    }
    documentDetailsModel.submitDataCompleted(
      req.params.id,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
    
  },
  getInHouseData: function (req, res) {
    req.propertyId =
      req.userDetails.user_type === constant.USER_TYPE.ADMIN
        ? req.query.property_id
        : req.userDetails.property_id;
    documentDetailsModel.getInHouseData(req, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  getWeeklyData: function (req, res) {
    req.propertyId =
      req.userDetails.user_type === constant.USER_TYPE.ADMIN
        ? req.query.property_id
        : req.userDetails.property_id;
    documentDetailsModel.getWeeklyData(req, function (err, response) {
      if (err) {
        responseSend.res(res, 500, false, { msg: "Internal server error" });
      } else {
        responseSend.res(res, 200, response.status, response);
      }
    });
  },
  setApplicationID: async function (req, res) {
    let userDetails = req.userDetails;
    if (typeof userDetails === "undefined") {
      responseSend.res(res, 200, false, {
        msg: "Please login your account again, your session token expired",
      });
      return;
    }
    documentDetailsModel.setApplicationID(
      req.body,
      function (err, response) {
        if (err) {
          responseSend.res(res, 500, false, { msg: "Internal server error" });
        } else {
          responseSend.res(res, 200, response.status, response);
        }
      }
    );
  },

  getDocumentInfo: async function (request, res) {
    let ocrData = {};
  var qs = require("qs");
  let result = { status: false };
    try {
        var bodyParams = request.body;
        if (!bodyParams.attachments) {
            throw new Error("Attachments not found");
        }
 
       
       // const front = "https://app.vivyapms.com/uploads/front_a.jpg";
       // const back = "https://app.vivyapms.com/uploads/back_a.jpg";
        // const back = "";
 
 
 // Parse attachments JSON string
var attachments = JSON.parse(bodyParams.attachments);
 
// Separate primary and secondary attachments
var frontAttachments = attachments.primary;
var backAttachments = attachments.back;
 
const frontFile = 'https://192.168.1.11:3000/uploads/' + frontAttachments.fileName;
console.log(frontFile)
let url = `http://localhost:8000/passport_visa_extraction?docFileName=${encodeURIComponent(frontFile)}`;
 

// Conditionally add the secondary_image parameter
if (backAttachments && backAttachments.fileName) {
    const backFile = 'https://192.168.1.11:3000/uploads/' + backAttachments.fileName;
    url += `&secondary_image=${encodeURIComponent(backFile)}`;
}
 
const resp = await axios.post(url);
 
        var forms =resp.data;
        console.log(forms)
                 
          Object.entries(forms).forEach(([key, value]) => {  
            switch (key) {
              case "first_name":
                ocrData.first_name = value;
                break;
              case "surname":
                  ocrData.family_name = value;
                  break;
              case "date_of_birth":
                ocrData.dob = value;
                  break;
              case "place_of_birth":
                    ocrData.place_of_birth = value;
                      break;
              case "country_code":
                ocrData.country_code = value;
                  break;
              case "country":
                    ocrData.country = value;
                      break;
              case "document_no":
                ocrData.passport_number = value;
                    break;
              case "sex":
                ocrData.gender = value;
                      break;
              case "date_of_issue":
                 ocrData.passport_issue_date = value;
                 break;
                 case "expiration_date":
                  ocrData.passport_expiry = value;
                  break;
               case "place_of_issue":
                  ocrData.passport_place_of_issue = value;
                  break;  
              case "img":
                    ocrData.img = value;
                    break;
              case "address":
                    ocrData.address = value;
                    break;
              case "address_line1":
                    ocrData.address_line1 = value;
                    break;
              case "address_line2":
                    ocrData.address_line2 = value;
                    break;
                    case "city":
                      ocrData.city = value;
                      break;
                      case "pincode":
                        ocrData.pincode = value;
                        break;
              case "type":
                      ocrData.type = value;
                      break;
             
       
          }
            result.ocrData = ocrData;
            result.documentType = ocrData.type;
            result.status = true;
          })
          responseSend.res(res, 200, true, { status: true, result : result });
          } catch (error) {
        console.error('Error:', error);
        responseSend.res(res, 500, false, { msg: 'Error processing request' });
    }
},
};


async function getOcrData(fileName) {
  const formData = new FormData();
  formData.append(
    "file",
    fs.createReadStream(__dirname + "/../uploads/" + fileName)
  );
  let result = { status: false };

  const ocrResponse = await axios
    .post(process.env.UPLOAD_OCR, formData, {
      headers: formData.getHeaders(),
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log("Error from get ocr =>", error);
    });

  if (typeof ocrResponse !== "undefined" && ocrResponse.status == 200) {
    result.ocrData = ocrResponse.data;
    result.documentType = "passport";
    result.status = true;
  }
  return result;
}
async function getOcrDataFromNanonet(fileName) {
  let ocrData = {};
  var qs = require("qs");
  let result = { status: false };

  //  const filePh = './uploads/'+fileName;
  try {
  const filePh = "https://192.168.1.11:3000/uploads/"+fileName;
  
  //const filePh = "https://vayyhospitality.com/uploads/file_1209197971653895196486.png";
  //  const resp=  await axios.post("http://13.235.238.108:8000/scandoc?docFileName="+filePh);
   const resp=  await axios.post("http://localhost:8000/passport_visa_extraction?docFileName="+filePh);

            var forms =resp.data;
  
            
    Object.entries(forms).forEach(([key, value]) => {  
      switch (key) {
        case "first_name":
          ocrData.first_name = value;
          break;
        case "surname":
            ocrData.family_name = value;
            break;
        case "date_of_birth":
          ocrData.dob = value;
            break;
        case "place_of_birth":
              ocrData.place_of_birth = value;
                break;
        case "country_code":
          ocrData.country_code = value;
            break;
        case "country":
              ocrData.country = value;
                break;
                case "document_no":
                  ocrData.passport_number = value;
                      break;
        case "sex":
          ocrData.gender = value;
                break;
        case "date_of_issue":
           ocrData.passport_issue_date = value;
           break;
           case "expiration_date":
            ocrData.passport_expiry = value;
            break;
         case "place_of_issue":
            ocrData.passport_place_of_issue = value;
            break;   
        case "img":
              ocrData.img = value;
              break;
        case "type":
                ocrData.type = value;
                break; 

    }
      result.ocrData = ocrData;
      result.documentType = ocrData.type;
      result.status = true;
    })
  } catch (error) {
    // Handle error if request fails
    console.log("Error fetching OCR data:", error.message);
    result.error = "Failed to retrieve OCR data. Please try again later.";
  }
    return result;
  }
  async function getOcrDataFromVisa(fileName) {
    let ocrData = {};
    var qs = require("qs");
    let result = { status: false };
  const filePh = "https://192.168.1.11:3000/uploads/"+fileName;
    const resp=  await axios.post("http://localhost:8000/visadoc?docFileName="+filePh);
    //const resp=  await axios.post("http://127.0.0.1:8000/visadoc?docFileName="+filePh);
  
            var forms =resp.data;
           console.log("##############formm",forms)
            
    Object.entries(forms).forEach(([key, value]) => {  
      switch (key) {
        case "visa_no":
          ocrData.visa_no = value;
          break;
       case "date_of_issue":
          ocrData.date_of_issue = value;
          break;
        case "expiration_date":
          ocrData.expiration_date = value;
          break;
       case "place_of_issue":
          ocrData.place_of_issue = value;
          break;
           case "country_code":
          ocrData.country_code = value;
          break;
           case "type":
          ocrData.type = value;
          break;
           case "visa_entry":
          ocrData.visa_entry = value;
          break;
  
        
  
    }
      result.ocrData = ocrData;
        if (ocrData.visa_no=="" && ocrData.date_of_issue=="" && ocrData.expiration_date=="" && ocrData.place_of_issue=="" && ocrData.country_code=="" && ocrData.type=="" && ocrData.visa_entry==""){
           result.documentType = "Document";
      }
      else{
         result.documentType = "visa";
      }
      result.status = true;
    })
    return result;
  }

//working code
  // async function uploadProfile(req, res) {
  //   let scanDocument;
  //   let uploadPath;
  //   let fileName;
  //   let baseName;
  
  //   let dir = `./uploads/`;
  
  //   scanDocument = req.files["profile-photo"];
  
  //   baseName = "profile_" + Math.floor(Math.random() * 1000000000) + Date.now();
  //   fileName = baseName + ".JPG";
  
  //   uploadPath = dir + fileName;
  //   fileType = scanDocument.mimetype;
  //   console.log("###################FILE TYPE",fileType)
  
  //   // Use the mv() method to place the file somewhere on your server
  //   await scanDocument.mv(uploadPath, function (err) {
  //     if (err) {
  //       responseSend.res(res, 500, false, { msg: "Internal server error" });
  //       return;
  //     }
  //   });
  //   return fileName;
  // }
  
  async function uploadProfile(req, res) {
    let scanDocument;
    let uploadPath;
    let fileName;
    let baseName;
  
    let dir = `./uploads/`;
  
    scanDocument = req.files["profile-photo"];
  
    console.log("#############PROFILE", scanDocument);
  
    baseName = "profile_" + Math.floor(Math.random() * 1000000000) + Date.now();
    fileName = baseName + ".JPG";
  
    uploadPath = dir + fileName;
    fileType = scanDocument.mimetype;
  
    // Use a promise-based approach to handle the mv() method
    try {
        await new Promise((resolve, reject) => {
            scanDocument.mv(uploadPath, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    } catch (err) {
        console.error("Error while moving the file:", err);
        responseSend.res(res, 500, false, { msg: "Internal server error" });
        return null;  // Return null to indicate failure
    }
  
    return fileName;
  }
  
  
  
  // async function uploadProfile(req, res) {
  //   let scanDocument;
  //   let uploadPath;
  //   let fileName;
  //   let baseName;
  
  //   let dir = `./uploads/`;
  
  //   scanDocument = req.files["profile-photo"];
  
  //   baseName = "profile_" + Math.floor(Math.random() * 1000000000) + Date.now();
  //   fileName = baseName + ".JPG";
  
  //   uploadPath = path.join(dir, fileName);
  
  //   // Use try-catch block for async/await error handling
  //   try {
  //     // Save the file to the original upload directory
  //     await scanDocument.mv(uploadPath);
  
  //     // Now copy the file to C://CommonUploads
  //     const commonUploadsPath = 'C://CommonUploads/';
  //     const commonUploadsFilePath = path.join(commonUploadsPath, fileName);
  
  //     // Use fs.createReadStream and fs.createWriteStream to copy the file
  //     const readStream = fs.createReadStream(uploadPath);
  //     const writeStream = fs.createWriteStream(commonUploadsFilePath);
  
  //     // Pipe the read and write operations to copy the file
  //     readStream.pipe(writeStream);
  
  //     // Handle errors and completion of file copy
  //     writeStream.on('finish', () => {
  //       console.log(`File copied to ${commonUploadsFilePath}`);
  //     });
  
  //     writeStream.on('error', (err) => {
  //       console.error('Error copying file:', err);
  //     });
  
  //     // Return the fileName or perform other actions as needed
  //     return fileName;
  //   } catch (err) {
  //     console.error('Error uploading file:', err);
  //     // Handle and respond to errors
  //     responseSend.res(res, 500, false, { msg: "Internal server error" });
  //   }
  // }


  // async function copyAttachmentFile(fileName, uploadDir) {
  //   const sourceFilePath = path.join(uploadDir, fileName);
  //   const currentDate = new Date().toISOString().split('T')[0];
  //   const destinationFolderPath = path.join('C:', 'Users', 'VR Della 2', 'OneDrive', 'Documents', 'vivyaPMS', currentDate);
  
  //   try {
  //     if (!fs.existsSync(destinationFolderPath)) {
  //       fs.mkdirSync(destinationFolderPath, { recursive: true });
  //       console.log(`Created folder '${currentDate}' for today's attachments.`);
  //     }
  
  //     const destinationFilePath = path.join(destinationFolderPath, fileName);
  
  //     fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
  //       if (err) {
  //         console.error(`Error copying attachment '${fileName}':`, err);
  //       } else {
  //         console.log(`Attachment '${fileName}' copied to '${destinationFolderPath}'.`);
  //         // Print document status
  //         const status = Math.random() < 0.5 ? 'Taken' : 'From DB'; // Example: randomly generate status
  //         console.log(`Document status: ${status}`);
  //       }
  //     });
  //   } catch (err) {
  //     console.error('Error while copying attachment:', err);
  //   }
  // }
 // Working code
    // async function copyAttachmentFile(fileName, uploadDir) {
    //   const sourceFilePath = path.join(uploadDir, fileName);
    //   const currentDate = new Date().toISOString().split('T')[0];
    //  // const destinationFolderPath = path.join('C:', 'Users', 'cctv', 'Documents', 'vivyaPMS', currentDate);
    //  const destinationFolderPath = path.join('C:', 'CommonUploads');
    //   try {
    //     console.log('Source File Path:', sourceFilePath);
    //     console.log('Destination Folder Path:', destinationFolderPath);
    
    //     if (!fs.existsSync(destinationFolderPath)) {
    //       fs.mkdirSync(destinationFolderPath, { recursive: true });
    //       console.log(`Created folder '${currentDate}' for today's attachments.`);
    //     }
    
    //     const destinationFilePath = path.join(destinationFolderPath, fileName);
    
    //     fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
    //       if (err) {
    //         console.error(`Error copying attachment '${fileName}':`, err);
    //       } else {
    //         console.log(`Attachment '${fileName}' copied to '${destinationFolderPath}'.`);
    //         const status = Math.random() < 0.5 ? 'Taken' : 'From DB';
    //         console.log(`Document status: ${status}`);
    //       }
    //     });
    //   } catch (err) {
    //     console.error('Error while copying attachment:', err);
    //   }
    // }

    // async function copyAttachmentFile(fileName, uploadDir) {
    //   const sourceFilePath = path.join(uploadDir, fileName);
    //   const currentDate = new Date().toISOString().split('T')[0];
    //   const destinationFolderPath = path.join('C:', 'CommonUploads');
    
    //   try {
    //     console.log('Source File Path:', sourceFilePath);
    //     console.log('Destination Folder Path:', destinationFolderPath);
    
    //     if (!fs.existsSync(destinationFolderPath)) {
    //       fs.mkdirSync(destinationFolderPath, { recursive: true });
    //       console.log(`Created folder '${currentDate}' for today's attachments.`);
    //     }
    
    //     const destinationFilePath = path.join(destinationFolderPath, fileName);
    
    //     // Use fs.promises.copyFile for asynchronous file copy
    //     await fs.promises.copyFile(sourceFilePath, destinationFilePath);
    
    //     console.log(`Attachment '${fileName}' copied to '${destinationFolderPath}'.`);
    //     const status = Math.random() < 0.5 ? 'Taken' : 'From DB';
    //     console.log(`Document status: ${status}`);
    //   } catch (err) {
    //     console.error('Error while copying attachment:', err);
    //   }
    // }
    
    // // Function to save multiple files to the same destination folder
    // async function saveMultipleFiles(fileNames, uploadDir) {
    //   for (const fileName of fileNames) {
    //     await copyAttachmentFile(fileName, uploadDir);
    //   }
    // }
    // async function copyAttachmentFileCommonUploads(fileName, uploadDir) {
    //   const sourceFilePath = path.join(uploadDir, fileName);
    //   //const destinationFolderPath = path.join('C:', 'Users', 'cctv', 'Documents', 'CommonUploads');
    //   const destinationFolderPath = "C:\CommonUploads";
    
    //   try {
    //     console.log('Source File Path:', sourceFilePath);
    //     console.log('Destination Folder Path:', destinationFolderPath);
    
    //     // Ensure the CommonUploads folder exists in the specified location
    //     if (!fs.existsSync(destinationFolderPath)) {
    //       fs.mkdirSync(destinationFolderPath, { recursive: true });
    //       console.log(`Created 'CommonUploads' folder for storing attachments.`);
    //     }
    
    //     const destinationFilePath = path.join(destinationFolderPath, fileName);
    
    //     // Copy the file from uploadDir to the CommonUploads folder
    //     fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
    //       if (err) {
    //         console.error(`Error copying attachment '${fileName}':`, err);
    //       } else {
    //         console.log(`Attachment '${fileName}' copied to 'CommonUploads' folder.`);
    //         const status = Math.random() < 0.5 ? 'Taken' : 'From DB';
    //         console.log(`Document status: ${status}`);
    //       }
    //     });
    //   } catch (err) {
    //     console.error('Error while copying attachment:', err);
    //   }
    // }