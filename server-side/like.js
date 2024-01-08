const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

const like_func = async (req, res) => {
  try {
    const jobId = req.params.jobid;

    // Query the database to get the file info
    const alike = await queryAsync('SELECT likeid, jobid, number FROM likes WHERE jobid = ?', [jobId]);
    if (alike.length === 0) {
      // insert
      dbConnection.query('INSERT INTO likes (jobid, number) VALUES (?, ?)', [jobId, 1], (err, results) => {
        if (err) return res.status(500).send('Server error');
        res.status(201).send('Like successfully');
      });
    } else {
      const row = alike[0];
      const curr = row.number + 1;
      dbConnection.query('UPDATE likes SET number= ? WHERE jobid = ?;', [curr, jobId], (err, results) => {
        if (err) return res.status(500).send('Server error');
        res.status(201).send('Like update successfully');
      });
    }
  } catch (err) {
    console.error('Error like:', err);
    res.status(500).send('Error like');
  }
};

module.exports = { like_func };
