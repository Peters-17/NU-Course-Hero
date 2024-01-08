//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const dbConnection = require('./database.js')

exports.get_users = (req, res) => {

  console.log("call to /users...");

  try {

    let sql = "Select * From users Order By userid;"

    //
    // call MySQL to execute query, we'll get a callback
    // when results are returned:
    //
    dbConnection.query(sql, (err, rows, fields) => {
      if (err) {
        res.status(400).json({
          "message": err.message,
          "data": []
        });
        return;
      }

      console.log("/users query done, retrieved",
        rows.length, "rows with", fields.length, "columns");

      //
      // done, respond with stats:
      //
      console.log("/users done, sending response...");
      
      res.json({
        "message": "success",
        "data": rows
      });
    });

  }//try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
