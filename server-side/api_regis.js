// The /register endpoint receives a username and password from the request body.
// It first checks if the username already exists in the database. 
// If it does, it responds with an error.
// If the username is unique, it hashes the password using bcrypt 
// and then inserts the new user into the database.
// Error handling is included to manage any potential issues during the process.


const bcrypt = require('bcrypt');
const dbConnection = require('./database.js'); // Ensure this path is correct

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      console.log(username);
      return res.status(400).send('Username and password are required');
    }

    // Check if username already exists
    dbConnection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) return res.status(500).send('Server error');

      if (results.length > 0) {
        return res.status(409).send('Username is already taken');
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        dbConnection.query('INSERT INTO users (username, pwdhash) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
          if (err) return res.status(500).send('Server error');
          res.status(201).send('User registered successfully');
        });
      }
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

module.exports = { register };

