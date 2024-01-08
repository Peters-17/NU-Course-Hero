const dbConnection = require('./database.js'); // Adjust the path as necessary
const config = require('./config.js'); // for ACCESS_TOKEN_SECRET

// Assuming you have a function for asynchronous database queries
const queryAsync = async (sql, params) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const alllikesfunc = async (req, res) => {
  try {
    const jobId = req.params.jobid;

    // Query the database to get the file info
    const alike = await queryAsync('SELECT * FROM likes');
    if (alike.length === 0) {
        res.status(500).send('Empty');
    } else {
        res.status(200).send(
            {
                data: alike
            }
        );
    }
  } catch (err) {
    console.error('Error fetch:', err);
    res.status(500).send('Error fetch');
  }
};

module.exports = { alllikesfunc };