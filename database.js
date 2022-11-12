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
        const sqlScript = 'SELECT * FROM user WHERE email = ?';
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

let GetUserFromID = function (userID) {
    return new Promise(function (resolve) {
        const sqlScript = 'SELECT * FROM user WHERE user_id = ?';
        mysql_pool.query(sqlScript, [userID], function (error, results, fields) {
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

let GetUser = function (limit) {
    return new Promise(function (resolve) {
        let sqlScript = 'SELECT * FROM user LIMIT ?';

        // if (query) {
        //     sqlScript += " WHERE ?";
        // }

        // let queryValue = "";
        // let count = 0;
        // for (const property in userID) {
        //     if (count > 0) {
        //         queryValue += " &&";
        //     }
        //     queryValue += ` ${property} = "${userID[property]}"`;
        //     count++;
        // } &&

        mysql_pool.query(sqlScript, [parseInt(limit)], function (error, results, fields) {
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
    // return bcrypt.compareSync(password, results[0].password);
    return password == results[0].password;
}

//save user's account with randomly generated id, hashed password
let createAccount = function (users) {
    // hash password
    // let password = users[3];
    // let hashed_password = bcrypt.hashSync(password, 10);
    // users[3] = hashed_password;

    const user_id = uuidv4();
    users.unshift(user_id);

    return new Promise(function (resolve) {
        const sqlScript = 'INSERT INTO user (user_id, email, password, first_name, last_name, date_of_birth, member_since, gender, phone_number, is_owner) VALUES (?)';

        mysql_pool.query(sqlScript, [users], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
        });
        resolve(user_id);
    });
}

let deleteAccount = function (userID) {
    return new Promise(function (resolve) {
        const sqlScript = 'DELETE FROM user WHERE user_id = ?;';

        mysql_pool.query(sqlScript, [userID], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;

            resolve(results);
        });
    });
}

module.exports = { GetUser, GetUserFromEmail, GetUserFromID, checkPassword, createAccount, deleteAccount }