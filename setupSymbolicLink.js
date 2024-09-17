// const fs = require('fs').promises;
// const path = require('path');

// const commonUploadsPath = 'C:\\CommonUploads'; // Adjust as neede
// //const commonUploadsPath = path.join(process.env.USERPROFILE, 'Documents', 'CommonUploads');
// //const commonUploadsPath = path.join('C:', 'Users' , 'cctv' , 'Documents' , 'CommonUploads' ,);
// // const userProfilePath = process.env.USERPROFILE;
// // const commonUploadsPath = path.join(userProfilePath, 'Documents', 'CommonUploads');

// const uploadsLinkPath = path.join(__dirname, 'uploads');

// // Function to create symbolic link
// async function createSymbolicLink() {
//   try {
//     // Remove existing 'uploads' directory
//     await fs.rm(uploadsLinkPath, { recursive: true });

//     // Create symbolic link
//     await fs.symlink(commonUploadsPath, uploadsLinkPath, 'junction');

//     console.log('Symbolic link created successfully.');
//   } catch (error) {
//     console.error('Error creating symbolic link:', error.message);
//     throw error; // Propagate the error for handling in the main application
//   }
// }

// // Export the function for use in the main application
// module.exports = { createSymbolicLink };

// // Run the function when this script is executed directly
// if (require.main === module) {
//   createSymbolicLink().catch((error) => {
//     console.error('Symbolic link creation failed:', error.message);
//     process.exit(1); // Terminate with a non-zero exit code to indicate failure
//   });
// }




// 
//above working 


const fs = require('fs').promises;
const path = require('path');

const commonUploadsPath = 'C:\\CommonUploads';
const uploadsLinkPath = path.join(__dirname, 'uploads');

// Function to create symbolic link
async function createSymbolicLink() {
  try {
    // Remove existing 'uploads' directory
    await fs.rm(uploadsLinkPath, { recursive: true });

    // Create symbolic link
    await fs.symlink(commonUploadsPath, uploadsLinkPath, 'junction');

    console.log('Symbolic link created successfully.');
  } catch (error) {
    console.error('Error creating symbolic link:', error.message);
    throw error; // Propagate the error for handling in the main application
  }
}

// Function to copy new files from 'uploads' to 'CommonUploads'
async function watchAndCopyFiles() {
  try {
    // Ensure 'CommonUploads' directory exists
    await fs.mkdir(commonUploadsPath, { recursive: true });

    // Watch for changes in 'uploads' directory using fs.watchFile()
    let previousFiles = [];

    setInterval(async () => {
      const files = await fs.readdir(uploadsLinkPath);

      // Find new files by comparing with previousFiles array
      const newFiles = files.filter((file) => !previousFiles.includes(file));

      for (const newFile of newFiles) {
        const sourceFilePath = path.join(uploadsLinkPath, newFile);
        const targetFilePath = path.join(commonUploadsPath, newFile);

        // Copy the new file to 'CommonUploads'
        await fs.copyFile(sourceFilePath, targetFilePath);
        console.log(`File copied to CommonUploads: ${newFile}`);
      }

      // Update previousFiles array
      previousFiles = files;
    }, 5000); // Check for new files every 5 seconds
  } catch (error) {
    console.error('Error watching and copying files:', error.message);
    throw error; // Propagate the error for handling in the main application
  }
}

// Export the functions for use in the main application
module.exports = { createSymbolicLink, watchAndCopyFiles };

// Run the functions when this script is executed directly
if (require.main === module) {
  createSymbolicLink().then(() => {
    watchAndCopyFiles().catch((error) => {
      console.error('Error watching and copying files:', error.message);
      process.exit(1); // Terminate with a non-zero exit code to indicate failure
    });
  }).catch((error) => {
    console.error('Symbolic link creation failed:', error.message);
    process.exit(1); // Terminate with a non-zero exit code to indicate failure
  });
}
