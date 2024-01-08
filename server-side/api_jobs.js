const dbConnection = require('./database.js'); // Ensure this is the correct path to your database module

const getAllJobs = async (req, res) => {
    try {
        const query = 'SELECT * FROM jobs';
        dbConnection.query(query, (err, results) => {
            if (err) {
                throw err;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).send('Error fetching jobs');
    }
};

module.exports = { getAllJobs };


