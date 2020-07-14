const bcrypt = require("bcryptjs");
//three functions bcrypt gives us:
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;
module.exports.hash = (plainTxPw) =>
    genSalt().then((salt) => hash(plainTxPw, salt));

// genSalt()
//     .then((salt) => {
//         console.log("salt:", salt);
//         return hash("plainTxtPw", salt);
//     })
//     .then((hashedPw) => {
//         console.log("hashedPw:", hashedPw);
//         return compare("hashedPw", hashedPw);
//     })
//     .then((matchValueCompare) => {
//         console.log("do plaintxt and pw Hash match?", matchValueCompare);
//     });
