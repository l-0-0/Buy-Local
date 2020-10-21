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
    let q = `SELECT first, last, age, city, url FROM users RIGHT JOIN signatures ON 
        users.id = signatures.user_id LEFT JOIN user_profiles ON users.id = user_profiles.user_id`;

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

module.exports.getPassword = function (email) {
    let q =
        'SELECT users.password, users.id AS "usersId", signatures.id AS "signaturesId" FROM users LEFT JOIN signatures ON users.id = signatures.user_id WHERE users.email = $1';
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

module.exports.getProfileInfo = function (userId) {
    let q =
        "SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url FROM users LEFT JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id = $1 ";
    let params = [userId];
    return db.query(q, params);
};

module.exports.updateProfileInfo = function (
    userId,
    newFirst,
    newLast,
    newEmail
) {
    let q = "UPDATE users SET first=$2, last=$3, email=$4 WHERE id = $1";
    // "UPDATE users SET first=$2, last=$3, email=$4, password=$5 WHERE id = $1";
    let params = [userId, newFirst, newLast, newEmail];
    // let params = [userId, newFirst, newLast, newEmail, newPass];
    return db.query(q, params);
};

module.exports.updatePassword = function (userId, hashedPass) {
    let q = "UPDATE users SET password=$2 WHERE id = $1";
    let params = [userId, hashedPass];
    return db.query(q, params);
};

module.exports.upsertProfileInfo = function (userId, newAge, newCity, newUrl) {
    let q =
        "INSERT INTO user_profiles (user_id, age, city ,url) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age=$2, city=$3 ,url=$4";
    let params = [userId, newAge, newCity, newUrl];
    return db.query(q, params);
};

module.exports.deleteSig = function (userId) {
    let q = "DELETE FROM signatures WHERE user_id=$1 ";
    let params = [userId];
    return db.query(q, params);
};
