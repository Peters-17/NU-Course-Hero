//
// Express js (and node.js) web service that interacts with 
// AWS S3 and RDS to provide clients data for building a 
// course hero like web app.
//
// Final project for CS 310, Fall 2023.
//
// References:
// Node.js: 
//   https://nodejs.org/
// Express: 
//   https://expressjs.com/
// MySQL: 
//   https://expressjs.com/en/guide/database-integration.html#mysql
//   https://github.com/mysqljs/mysql
// AWS SDK with JS:
//   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
//   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-nodejs.html
//   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
//   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
//

const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { post_pdf } = require('./api_upload'); // Adjust the path as necessary
const { getAllJobs } = require('./api_jobs'); // Adjust the path as necessary


const app = express();
const config = require('./config.js');
const alllikes = require('./list.js');


const dbConnection = require('./database.js')
const { HeadBucketCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

app.use(express.json({strict : false, limit : "50mb"}));

var startTime;

app.listen(config.service_port, () => {
  startTime = Date.now();
  console.log('web service running...');
  //
  // Configure AWS to use our config file:
  //
  process.env.AWS_SHARED_CREDENTIALS_FILE = config.photoapp_config;
});

app.get('/', (req, res) => {

  var uptime = Math.round((Date.now() - startTime) / 1000);

  res.json({
    "status": "running",
    "uptime-in-secs": uptime,
    "dbConnection": dbConnection.state
  });
});

//
// service functions:
//
let regis = require('./api_regis.js');   // register a user
let users = require('./api_users.js');   // list all users
let login = require('./api_login.js');   // login a users
const download = require('./api_download.js');
const compute = require('./compute.js');
const like = require('./like.js');


const { strict } = require('assert');

app.post('/regis', regis.register); 
app.get('/users', users.get_users);
app.post('/login', login.login);
app.post('/pdf/:userid', upload.single('file'), post_pdf);

app.get('/like/:jobid', like.like_func);
app.get('/download/:jobid', download.download_file);

app.get('/jobs', getAllJobs);
app.get('/compute/:jobid', compute.compute_file);
app.get('/likelist', alllikes.alllikesfunc);

