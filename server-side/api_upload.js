//
//  app.post('/pdf/:userid', async (req, res) => {...});
//  Upload a PDF file to S3 and store to DB
//  User should input  as form - data
//      
//  Example front-end form:
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <title>PDF Upload Form</title>
// </head>
// <body>
//     <h2>Upload a PDF File</h2>
//     <form id="uploadForm" action="http://localhost:8080/pdf/123" method="post" enctype="multipart/form-data">
//         <input type="hidden" name="courseid" value="CS101"> <!-- Hidden field for courseid -->
//         <label for="fileUpload">Select a PDF file:</label>
//         <input type="file" id="fileUpload" name="file" accept="application/pdf">
//         <button type="submit">Upload</button>
//     </form>

//     <script>
//         document.getElementById('uploadForm').addEventListener('submit', function(e) {
//             e.preventDefault();

//             const formData = new FormData(this);
//             fetch(this.action, {
//                 method: 'POST',
//                 body: formData
//             })
//             .then(response => response.json())
//             .then(data => console.log(data))
//             .catch(error => console.error('Error:', error));
//         });
//     </script>
// </body>
// </html>
//


const dbConnection = require('./database.js');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');
const uuid = require('uuid');

const queryAsync = (sql, params) => new Promise((resolve, reject) => {
    dbConnection.query(sql, params, (err, results) => {
        if (err) {
            reject(err);
        } else {
            resolve(results);
        }
    });
});

exports.post_pdf = async (req, res) => {
    console.log("call to /pdf...");

    try {
        const userId = req.params.userid;
        const courseid = req.body.courseid;

        if (!req.file) {
            throw new Error("No file uploaded...");
        }

        // Verify user exists
        const userCheckResult = await queryAsync('SELECT * FROM users WHERE userid = ?', [userId]);
        if (userCheckResult.length === 0) {
            throw new Error("No such user...");
        }
        const bucketFolder = "job_";

        // Use the file buffer directly
        const pdfBuffer = req.file.buffer;

        // Generate unique filename
        const uniqueKey = uuid.v4() + '.pdf';
        const s3Key = `${bucketFolder}/${uniqueKey}`;
        
        // Get the original filename
        const originalFileName = req.file.originalname; // This is the original file name


        // Upload to S3
        const putObjectParams = {
            Bucket: s3_bucket_name,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf'
        };
        try {
            await s3.send(new PutObjectCommand(putObjectParams));
        } catch (awsError) {
            console.error("AWS S3 Error:", awsError);
            throw awsError;
        }

        // Insert into database (jobs table)
        const insertResult = await queryAsync('INSERT INTO jobs (userid, courseid, status, originaldatafile, datafilekey) VALUES (?, ?, ?, ?, ?)', [userId, courseid, 'completed', originalFileName, s3Key]);
        res.json({ "message": "success", "jobid": insertResult.insertId });
    } catch (err) {
        console.log("**ERROR:", err.message);
        res.status(400).json({
            "message": err.message,
            "jobid": -1
        });
    }
};
