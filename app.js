/*
 Author: Jayamurugan
 Description: define route, session, view and view engine, cors, route error handling
 */

 // import
 const exppress = require('express');
 const bodyParser = require('body-parser');
 var path = require('path');
 var cookieParser = require('cookie-parser');
 var session = require('express-session');
 const fileUpload = require('express-fileupload');
 const cors = require('cors');
 const dotenv = require('dotenv');
 dotenv.config();
 const app = exppress();
 const _ = require('lodash');
 const os = require('os'); // Import the os module
//  const express = require('express');
 
 const port = 3000;
 
 // access lodash from ejs inside
 app.locals._ = _;
 
 app.use(cookieParser());
 
 // set session config
 app.use(session({
   secret: "passport-scan-secret",
   resave: false,
   cookie: { maxAge: 2 * 60 * 60 * 1000 },
   saveUninitialized: false
 }));
 
 // set file upload config
 app.use(fileUpload({
   limits: { fileSize: 100 * 1024 * 1024 }, // 10 mb
   abortOnLimit:true
 }));
 
 // view engine setup
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'ejs');
 
 
 app.engine('ejs', require('ejs').__express);
 // set path for static assets
 app.use(exppress.static(path.join(__dirname, 'public')));
 
 // config cors and body parser
 app.use(cors());
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());
 
 // get routes
 const superAdminRoute = require('./v1/super-admin');
 const apiRoute = require('./v1/api');
 const publicRoute = require('./v1/public');
 const routePermission = require('./v1/routing-permission');
 
 
 // set routes
 app.use('/', publicRoute);
 app.use('/', routePermission);
 app.use('/', superAdminRoute);
 app.use('/v1/api', apiRoute);
 
 // set path for static upload
 app.use('/uploads',exppress.static(path.join(__dirname, 'uploads')));
 
 // catch 404 and forward to error handler
 app.use(function (req, res, next) {
   var err = new Error('Not Found');
   err.status = 404;
   next(err);
 });
 
 // error handler
 app.use(function (err, req, res, next) {
   // render the error page
   // res.status(err.status || 500);
   console.log( 'message',err.message);
   const pageName = err.status === 404 ? 404 : 500;
   res.render("pages/error-"+pageName, { title: "Internal server error - 500", baseUrl: process.env.BASE_URL });
   // res.render('error', { status: err.status, message: err.message });
 });
//  app.listen(port, () => {
//    console.log(`Server started on port ${port}`);
//  });


app.post('/process-image', (req, res) => {
  const { image } = req.body;
  if (!image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
  }

  // Convert data URI to buffer
  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, 'base64');

  // Write the image buffer to a file
  const imagePath = 'temp_image.png';
  fs.writeFileSync(imagePath, imageBuffer);

  // Call the Python script for document detection
  exec(`python document_detection.py ${imagePath}`, (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ success: false, message: 'Error processing the image' });
      }

      if (stderr) {
          console.error(`stderr: ${stderr}`);
          return res.status(500).json({ success: false, message: 'Error processing the image' });
      }

      const resultImagePath = stdout.trim();
      if (resultImagePath && fs.existsSync(resultImagePath)) {
          res.json({ success: true, resultPath: resultImagePath });
      } else {
          res.json({ success: false, message: 'No document boundary detected' });
      }

      // Clean up temporary files
      fs.unlinkSync(imagePath);
  });
});

const networkInterfaces = os.networkInterfaces();
let networkIp;

for (const key of Object.keys(networkInterfaces)) {
  const iface = networkInterfaces[key][0];
  if (iface.family === 'IPv4' && !iface.internal) {
    networkIp = iface.address;
    break; // Stop after finding the first non-internal IPv4 interface
  }
}

if (networkIp) {
  console.log(`Network IP: ${networkIp}`);
} else {
  console.error('No active network interface found.');
}

const https = require('https');
const fs = require('fs');

// Load your self-signed SSL certificate and private key
const privateKey = fs.readFileSync(path.join(__dirname, 'server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'server.crt'), 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
};

// Create an HTTPS server using your Express app and SSL credentials
//const httpsServer = https.createServer(credentials, app);
const server = https
  .createServer(
    {
      key: fs.readFileSync("test-key.pem"),
      cert: fs.readFileSync("test-cert.pem"),
      passphrase: "Vrdella!6",
    },
    app
  )
  // .listen(PORT, () => {
  //   console.log(`Secure server listening on port:${PORT}`);
  // });
  server.listen(port, () => {
  console.log(`Server started on ${networkIp}:${port} using HTTPS`);
});



// Start the Express.js app
// app.listen(port, networkIp, () => {
//   console.log(`Server started on ${networkIp}:${port}`);
// });


 module.exports = app;
