// // app.get('/download/:jobid', download.download_file);
// const fs = require('fs');
// const path = require('path');
// const { GetObjectCommand } = require('@aws-sdk/client-s3');
// const { s3, s3_bucket_name } = require('./aws.js'); // Adjust path as necessary
// const dbConnection = require('./database.js'); // Adjust path as necessary

// // Utility function for database queries
// const queryAsync = (sql, params) => new Promise((resolve, reject) => {
//     dbConnection.query(sql, params, (err, results) => {
//         if (err) {
//             reject(err);
//         } else {
//             resolve(results);
//         }
//     });
// });

// // Function for downloading a file and saving it locally
// exports.download_file = async (req, res) => {
//     try {
//         const jobId = req.params.jobid;

//         // Query the database to get the file info
//         const jobResult = await queryAsync('SELECT originaldatafile, datafilekey FROM jobs WHERE jobid = ?', [jobId]);
//         if (jobResult.length === 0) {
//             return res.status(404).send('Job not found');
//         }
//         const { originaldatafile, datafilekey } = jobResult[0];

//         // Get the file from S3
//         const getObjectParams = {
//             Bucket: s3_bucket_name,
//             Key: datafilekey
//         };
//         const data = await s3.send(new GetObjectCommand(getObjectParams));

//         // Determine the content type or use a default value
//         const contentType = data.ContentType || 'application/octet-stream';

//         // Set headers to download file with original file name
//         res.setHeader('Content-Disposition', 'attachment; filename="' + originaldatafile + '"');
//         res.setHeader('Content-Type', contentType);

//         // Save the file locally
//         const localFilePath = path.join(__dirname, originaldatafile);
//         const fileStream = fs.createWriteStream(localFilePath);
//         data.Body.pipe(fileStream);

//         fileStream.on('finish', () => {
//             res.send('File downloaded successfully');
//         });

//     } catch (err) {
//         console.error('Error downloading file:', err);
//         res.status(500).send('Error downloading file');
//     }
// };

const fs = require('fs');
const path = require('path');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name } = require('./aws.js');
const dbConnection = require('./database.js');

// Utility function for database queries
const queryAsync = (sql, params) => new Promise((resolve, reject) => {
    dbConnection.query(sql, params, (err, results) => {
        if (err) {
            reject(err);
        } else {
            resolve(results);
        }
    });
});

// Function for streaming a file directly from S3 to the client
exports.download_file = async (req, res) => {
    try {
        const jobId = req.params.jobid;

        // Query the database to get the file info
        const jobResult = await queryAsync('SELECT originaldatafile, datafilekey FROM jobs WHERE jobid = ?', [jobId]);
        if (jobResult.length === 0) {
            return res.status(404).send('Job not found');
        }
        const { originaldatafile, datafilekey } = jobResult[0];

        // Get the file from S3
        const getObjectParams = {
            Bucket: s3_bucket_name,
            Key: datafilekey
        };
        const data = await s3.send(new GetObjectCommand(getObjectParams));

        // Set headers for the file download
        res.setHeader('Content-Disposition', 'attachment; filename="' + originaldatafile + '"');
        res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');

        // Stream the file directly to the client
        data.Body.pipe(res);

    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
    }
};


