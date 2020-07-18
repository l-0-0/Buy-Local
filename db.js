//every database query is live in this file.

const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL || "postgres:postgres:Hoda@localhost:5432/petition"
);

module.exports.addSignature = (userId, signature) => {
    //$1 makes the query safer
    let q =
        "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id";

    // "params" is sth you only have to do if the query takes arguments
    //params is always an array
    let params = [userId, signature];
    return db.query(q, params);
};

module.exports.getSigners = function () {
    let q = "SELECT COUNT(*) FROM signatures";

    return db.query(q);
};
module.exports.getSignersName = function () {
    let q =
        "SELECT first, last, age, city, url FROM users RIGHT JOIN signatures ON users.id = signatures.user_id LEFT JOIN user_profiles ON users.id = user_profiles.user_id ";

    return db.query(q);
};

module.exports.sigImage = function (id) {
    let q = "SELECT signature FROM signatures WHERE id = $1";
    let params = [id];
    return db.query(q, params);
};

module.exports.register = function (firstName, lastName, email, password) {
    let q =
        "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id";
    let params = [firstName, lastName, email, password];
    return db.query(q, params);
};

//Change the SELECT that gets user id and password by email address
//to join the signatures table and get the signature id as well

module.exports.getPassword = function (email) {
    let q =
        "SELECT users.password, users.id AS usersId, signatures.id AS signaturesId FROM users LEFT JOIN signatures ON users.id = signatures.user_id WHERE users.email = $1";
    let params = [email];
    return db.query(q, params);
};

module.exports.addProfile = function (age, city, url, userId) {
    let q =
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id";
    let params = [+age || null, city || null, url || null, userId];
    return db.query(q, params);
};

module.exports.getSignersCity = function (city) {
    let q =
        "SELECT first, last, age, city, url FROM users RIGHT JOIN signatures ON users.id = signatures.user_id LEFT JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(city) = LOWER($1) ";
    let params = [city];
    return db.query(q, params);
};
