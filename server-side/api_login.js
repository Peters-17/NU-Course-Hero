// 
// Login a user
// send back accessToken if success
// 
//

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConnection = require('./database.js'); // Adjust the path as necessary
const config = require('./config.js');        // for ACCESS_TOKEN_SECRET

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    dbConnection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            return res.status(500).send('Error during database query');
        }

        if (results.length === 0) {
            return res.status(401).send('Incorrect username or password');
        }

        const user = results[0];
        if (await bcrypt.compare(password, user.pwdhash)) {
            const accessToken = jwt.sign(
                { username: user.username, userid: user.userid  },
                config.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ accessToken:accessToken, username:user.username, userid: user.userid });
        } else {
            return res.status(401).send('Incorrect username or password');
        }
    });
};

module.exports = { login };
