// const mysql = require('mysql2');
// const dotenv = require('dotenv');
// const { promisify } = require('util');
// const fs = require('fs');
// const path = require('path');
// const https = require('https');

// dotenv.config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',	
//   user: process.env.NODE_ENV === 'development'
//   ? process.env.DB_USER
//   : process.env.DB_USER_LIVE,
//   password: process.env.NODE_ENV === 'development'
//   ? process.env.DB_PASS
//   : process.env.DB_PASS_LIVE,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3306,
//   connectionLimit: 30,
// });

// pool.getConnection((err, connection) => {
//   if (err) {
//   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//     console.error('Database connection was closed.');
//   }
//   if (err.code === 'ER_CON_COUNT_ERROR') {
//     console.error('Database has too many connections');
//   }
//   if (err.code === 'ECONNREFUSED') {
//     console.error('Database connection was refused');
//   }
//   }

//   if (connection) {
//   // Execute the SET GLOBAL sql_mode query here
//   connection.query(
//     "SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))",
//     (err, results) => {
//     if (err) {
//       console.error('Error setting SQL mode:', err);
//     } else {
//       console.log('SQL mode set successfully.');
//     }

//     connection.release(); // Release the connection
//     }
//   );
//   }

//   console.log('DB is Connected');
//   checkAndBackupImages();
//   setInterval(checkAndBackupImages, 30 * 1000); // Check every 30 seconds
//   return;
// });

// // Promisify Pool Queries
// pool.query = promisify(pool.query);

// pool.on('connection', function (connection) {
//   connection.on('enqueue', function (sequence) {
//   if ('Query' === sequence.constructor.name) {
//     if (process.env.NODE_ENV === 'development') {
//     console.log('Query => ' + sequence.sql + '\n\n');
//     }
//   }
//   });
// });

// // Function to save a copy of the image locally
// async function saveImageLocally(imageUrl, destinationFileName) {
//   const folderName = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
// const destinationFolder = path.join(
//   process.env.USERPROFILE,
//   'Documents',
//   'VIVYAPMS', // Replace with your desired folder name
//   folderName // Append the date folder
// );
//   // Create the folder if it doesn't exist
//   try {
//   fs.mkdirSync(destinationFolder, { recursive: true });
//   console.log('Folder created:', destinationFolder); // Log the created folder path
//   } catch (error) {
//   if (error.code !== 'EEXIST') {
//     // Ignore the error if the folder already exists
//     console.error('Error creating folder:', error.message);
//     return; // Exit the function if folder creation fails
//   }
//   }

//   const sanitizedFileName = destinationFileName.replace(/[\/\?<>\\:\*\|":]/g, '_'); // Replace special characters with underscores
//   const destPath = path.join(destinationFolder, sanitizedFileName);



//   // Download the image with retries
//   const maxRetries = 3;
//   let retries = 0;

//   async function downloadImage() {
//   retries++;

//   const file = fs.createWriteStream(destPath);
//   const options = {
//     rejectUnauthorized: false, // Ignore SSL certificate issues
//   };

//   const request = https.get(imageUrl, options, function (response) {
//     response.pipe(file);
//     file.on('finish', function () {
//     file.close();
//     console.log('File saved locally:', destPath);
//     });
//   });

//   request.on('error', function (err) {
//     fs.unlink(destPath, () => {}); // Delete the file if there is an error
//     console.error('Error downloading image:', err.message);

//     if (retries < maxRetries) {
//     console.log(`Retrying download (attempt ${retries} of ${maxRetries})...`);
//     downloadImage(); // Retry the download
//     } else {
//     console.error(`Max retries reached. Unable to download image.`);
//     }
//   });
//   }

//   downloadImage(); // Start the download
// }

// // Function to check for new images in the database and save them locally
// // Load the .env file
// require('dotenv').config();

// // ...


// async function checkAndBackupImages() {
//   try {
//   const [attachmentResult, attachmentFields] = await pool.query(
//     `SELECT attachments.*, map_room_document.primary_document_id
//      FROM attachments
//      LEFT JOIN map_room_document ON attachments.document_id = map_room_document.secondary_document_id
//      ORDER BY attachments.created_at DESC
//      LIMIT 1`
//   );

//   console.log('Query result:', attachmentResult);

//   const attachmentRows = Array.isArray(attachmentResult) ? attachmentResult : [attachmentResult];

//   if (!attachmentRows || attachmentRows.length === 0) {
//     console.log('No new attachments found.');
//     return;
//   }

//   for (const latestAttachment of attachmentRows) {
//     if (!latestAttachment.file_name) {
//     console.log('No file name found in the latest attachment.');
//     continue;
//     }

//     // Fetch the given name directly from the document_details table
//     const givenNameResult = await pool.query(
//     'SELECT given_name FROM document_details WHERE document_details_id = ?',
//     [latestAttachment.document_id]
//     );

//     console.log('Given name result:', givenNameResult);

//     // Ensure the result is an array with at least one element
//     if (Array.isArray(givenNameResult) && givenNameResult.length > 0) {
//     // Extract the given name from the first result in the array
//     const givenName = givenNameResult[0].given_name;

//     console.log('Given name from document details:', givenName);

//     if (givenName) {
//       // Update the query to retrieve room information based on secondary document ID
//       const roomIdsResult = await pool.query(
//       `SELECT DISTINCT mrd.room_id
//        FROM map_room_document mrd
//        WHERE mrd.document_id = ?
//         OR mrd.primary_document_id = ?
//         OR mrd.secondary_document_id LIKE ?`,
//       [latestAttachment.document_id, latestAttachment.primary_document_id, `%${latestAttachment.document_id}%`]
//       );

//       console.log('Room IDs result:', roomIdsResult);

//       // Ensure the result is an array with at least one element
//       if (Array.isArray(roomIdsResult) && roomIdsResult.length > 0) {
//       const roomIds = roomIdsResult.map(result => result.room_id);

//       console.log('Room IDs:', roomIds);

//       // Now you can use the room IDs as needed in your application logic
//       // For example, you might want to process each room ID and save images locally
//       for (const roomId of roomIds) {
//         const roomNameResult = await pool.query(
//         'SELECT name FROM room WHERE room_id = ?',
//         [roomId]
//         );

//         const roomName = roomNameResult.length > 0 ? roomNameResult[0].name : null;

//         const baseUrl = process.env.BASE_URL;
//         const imageUrl = `${baseUrl}uploads/${latestAttachment.file_name}`;
//         console.log(imageUrl);
//         const destinationFileName = `${givenName.replace(/\s+/g, '_')}_${roomName}.png`;

//         await saveImageLocally(imageUrl, destinationFileName);
//         console.log('Image saved with the given name, room name, and file name:', destinationFileName);
//       }
//       } else {
//       console.log('No room IDs found in map_room_document.');
//       }
//     } else {
//       console.log('No given name found in document details.');
//     }
//     } else {
//     console.log('No given name found in document details.');
//     }
//   }

//   } catch (error) {
//   console.error('Error checking for new images:', error.message);
//   }
// }

// module.exports = pool;



const mysql = require('mysql2');
const dotenv = require('dotenv');
const { promisify } = require('util');

dotenv.config();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.NODE_ENV === 'development'
    ? process.env.DB_USER
    : process.env.DB_USER_LIVE,
  password: process.env.NODE_ENV === 'development'
    ? process.env.DB_PASS
    : process.env.DB_PASS_LIVE,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 30,
});

// Handle initial database connection and set SQL mode
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }

  // Execute SQL query to adjust SQL mode (disable ONLY_FULL_GROUP_BY)
  connection.query(
    "SET @@sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')",
    (err, results) => {
      if (err) {
        console.error('Error setting SQL mode:', err);
      } else {
        console.log('SQL mode adjusted successfully.');
      }

      // Release the connection back to the pool
      connection.release();
    }
  );
});

// Promisify pool queries
pool.query = promisify(pool.query);

// Query to fetch attachments
async function fetchAttachments() {
  try {
    const query = `
      SELECT a.id AS attachment_id, a.file_name AS file_name, d.given_name AS given_name
      FROM attachments a
      JOIN document_details d ON a.document_id = d.document_details_id
      WHERE a.id > (SELECT MAX(id) FROM attachments)
    `;

    const attachments = await pool.query(query);
    return attachments;
  } catch (error) {
    console.error('Error fetching attachments:', error);
    throw error; // Propagate the error back to the caller
  }
}

module.exports = {
  pool,
  fetchAttachments
};

// // Function to monitor attachments for new entries
// async function monitorAttachments() {
//   try {
//     console.log('Monitoring attachments table for new entries...');
//     const results = await pool.query(query);

//     if (results.length > 0) {
//       console.log('New attachments detected. Copying files...');
//       results.forEach((row) => {
//         const attachmentId = row.attachment_id;
//         const fileName = row.file_name;
//         const givenName = row.given_name;

//         // Construct source and destination paths
//         const sourceFilePath = path.join(__dirname, 'uploads', fileName);
//         const destinationFolderPath = path.join(__dirname, '..', '..', 'Documents', 'vivyaPMS', givenName);
//         const destinationFilePath = path.join(destinationFolderPath, fileName);

//         // Check if source file exists
//         if (fs.existsSync(sourceFilePath)) {
//           // Ensure destination folder exists
//           if (!fs.existsSync(destinationFolderPath)) {
//             fs.mkdirSync(destinationFolderPath, { recursive: true });
//           }

//           // Copy file to destination folder
//           fs.copyFileSync(sourceFilePath, destinationFilePath);
//           console.log(`Attachment ${attachmentId}: File copied successfully to ${destinationFilePath}`);
//         } else {
//           console.error(`Attachment ${attachmentId}: Source file ${sourceFilePath} does not exist`);
//         }
//       });
//     } else {
//       console.log('No new attachments found.');
//     }
//   } catch (error) {
//     console.error('Error while monitoring attachments:', error);
//   }
// }

// // Start monitoring attachments
// monitorAttachments();


module.exports = pool;
