const mysql = require('mysql');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

var mysql_pool = mysql.createPool({
    host: "us-cdbr-east-06.cleardb.net",
    user: "bfeb18c3539189",
    password: "2101ba18",
    database: "heroku_687ce1ec86d392a"
})

let GetUserFromEmail = function (email) {
    return new Promise(function (resolve, reject) {
        const sqlScript = 'SELECT * FROM user WHERE email = ?';
        mysql_pool.query(sqlScript, [email], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) reject(error);

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
    return new Promise(function (resolve, reject) {
        const sqlScript = 'SELECT * FROM user WHERE user_id = ?';
        mysql_pool.query(sqlScript, [userID], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) reject(error);

            // If the account exists
            if (results.length > 0) {
                resolve(results);
            } else {
                resolve(null);
            }
        });
    });
}

let GetUser = function (queryObject) {
    return new Promise(function (resolve, reject) {
        const { limit, first_name, last_name, dob, member_since, gender, is_owner } = queryObject;

        let sqlScript = 'SELECT * FROM user';

        if (limit) {
            sqlScript += " LIMIT ?"
        }
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
            if (error) reject(error);

            console.log(results)

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

    return new Promise(function (resolve, reject) {
        const sqlScript = 'INSERT INTO user (user_id, email, password, first_name, last_name, date_of_birth, member_since, gender, phone_number, is_owner) VALUES (?)';

        mysql_pool.query(sqlScript, [users], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) reject(error);

            resolve(user_id);
        });
    });
}

let deleteAccount = function (userID) {
    return new Promise(function (resolve, reject) {
        const sqlScript = 'DELETE FROM user WHERE user_id = ?;';

        mysql_pool.query(sqlScript, [userID], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) reject(error);

            resolve(results);
        });
    });
}

module.exports = { GetUser, GetUserFromEmail, GetUserFromID, checkPassword, createAccount, deleteAccount }