module.exports.isUserLoggedIn = function isUserLoggedIn(req, res, next) {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.isUserSigned = function isUserSigned(req, res, next) {
    //has the user signed the petition?
    if (req.session.sigId) {
        res.redirect("/petition/thanks");
    } else {
        next();
    }
};

module.exports.isUserNotSigned = function isUserNotSigned(req, res, next) {
    if (!req.session.signed) {
        res.redirect("/petition");
    } else {
        next();
    }
};
