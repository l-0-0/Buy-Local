//every database query is live in this file.

const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:Hoda@localhost:5432/petition");

module.exports.addSignature = (firstName, lastName, signature) => {
    //$1 makes the query safer
    let q =
        "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id";

    // "params" is sth you only have to do if the query takes arguments
    //params is always an array
    let params = [firstName, lastName, signature];
    return db.query(q, params);
};

module.exports.getSigners = function () {
    let q = "SELECT COUNT(*) FROM signatures";

    return db.query(q);
};
module.exports.getSignersName = function () {
    let q = "SELECT first, last FROM signatures";

    return db.query(q);
};

module.exports.sigImage = function (id) {
    let q = "SELECT signature FROM signatures WHERE id = $1";
    let params = [id];
    return db.query(q, params);
};
