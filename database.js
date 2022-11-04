const mysql = require('mysql');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

var mysql_pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "changbiet247",
    database: "bookinghub"
})

let GetUserFromEmail = function (email) {
    return new Promise(function (resolve) {
        const sqlScript = 'SELECT * FROM owner WHERE email = ?';
        mysql_pool.query(sqlScript, [email], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;

            // If the account exists
            if (results.length > 0) {
                resolve(results);
            } else {
                resolve(null);
            }
        });
    });
}

let checkPassword = function (results, password) {
    return bcrypt.compareSync(password, results[0].password);
}

//save user's account with randomly generated id, hashed password
let createAccount = function (users) {
    // hash password
    let password = users[3];
    let hashed_password = bcrypt.hashSync(password, 10);
    users[3] = hashed_password;

    // const user_id = uuidv4();
    const user_id = 4;
    users.unshift(user_id);


    return new Promise(function (resolve) {
        const sqlScript = 'INSERT INTO owner (owner_id, email, phone_number, username, password) VALUES (?)';

        mysql_pool.query(sqlScript, [users], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
        });
        resolve(user_id);
    });
}

module.exports = {GetUserFromEmail: GetUserFromEmail, checkPassword, createAccount}