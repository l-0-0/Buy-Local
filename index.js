const express = require("express");
const db = require("./db");
const csurf = require("csurf");
const { hash, compare } = require("./bc");

const app = express();

const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

const hb = require("express-handlebars");
const { request } = require("express");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//for params and read the req.body
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

//it prevents of clickjacking
// app.use(function (req, res, next) {
//     res.setHeader("x-frame-options", "deny");
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });

//it has to be after cookie session and urlencoded
// app.use(csurf());

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (req.session.signed === "done") {
        res.redirect("/petition/thanks");
    } else {
        res.render("petition", {
            layout: "main",
            error: false,
        });
    }
});

// insert, delete or update a database is in post request
app.post("/petition", (req, res) => {
    // console.log(req.body.firstName, req.body.lastName, req.body.data);
    db.addSignature(req.session.userId, req.body.data)
        .then((results) => {
            req.session.signed = "done";
            req.session.sigId = results.rows[0].id;
            // console.log(results.rows[0].id);
            res.redirect("/petition/thanks");
        })
        .catch((err) => {
            res.render("petition", {
                layout: "main",
                error: true,
            });
            console.log("err in POST", err);
        });
    // console.log("req.cookies:", req.cookies);
});
app.get("/petition/thanks", (req, res) => {
    if (req.session.signed !== "done") {
        res.redirect("/petition");
    } else {
        db.getSigners()
            .then((results) => {
                // console.log("results.row", results.rows[0].count);
                let numberofSignatures = results.rows[0].count;
                db.sigImage(req.session.sigId).then((results) => {
                    let signatureUrl = results.rows[0].signature;
                    // console.log(signatureUrl);

                    res.render("thankYou", {
                        layout: "main",
                        numberofSignatures,
                        signatureUrl,
                    });
                });
            })
            .catch((err) => {
                console.log("err in GET", err);
            });
    }
});

app.get("/petition/signed", (req, res) => {
    if (req.session.signed !== "done") {
        res.redirect("/petition");
    } else {
        db.getSignersName()
            .then((results) => {
                let signersName = results.rows;
                // console.log(signersName);

                res.render("signed", {
                    layout: "main",
                    signersName,
                });
            })
            .catch((err) => {
                console.log("err in GET", err);
            });
    }
});

app.get("/petition/signed/:city", (req, res) => {
    let city = req.params.city;
    db.getSignersCity(city).then((results) => {
        // console.log(results.rows[0].city);
        let signersName = results.rows;
        res.render("signed", {
            layout: "main",
            signersName,
            city,
        });
    });
});

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "main",
        error: false,
    });
});

app.post("/register", (req, res) => {
    // console.log(req.body.password);
    hash(req.body.password)
        .then((hashedPw) => {
            db.register(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                hashedPw
            ).then((results) => {
                // console.log("hashed user password:", hashedPw);
                req.session.userId = results.rows[0].id;
                res.redirect("/profile");
            });
        })
        .catch((err) => {
            console.log("error in hash in POST register", err);
            res.render("registration", {
                layout: "main",
                error: true,
            });
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        error: false,
    });
});

app.post("/login", (req, res) => {
    db.getPassword(req.body.email).then((results) => {
        console.log(req.body.email, results.rows[0].password);
        if (!results.rows[0]) {
            res.render("login", {
                layout: "main",
                error: true,
            });
        } else {
            // console.log(req.body.password, results.rows[0].password);
            compare(req.body.password, results.rows[0].password).then(
                (matchValue) => {
                    console.log(
                        "does the user password match our hash in the database?",
                        matchValue
                    );
                    if (matchValue) {
                        req.session.userId = results.rows[0].id;
                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            layout: "main",
                            error: true,
                        });
                    }
                }
            );
        }
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    // console.log("cookies:", req.session);
    if (!req.body.age && !req.body.city && !req.body.url) {
        res.redirect("/petition");
    } else {
        if (!req.body.url.startsWith("https://", "http://", "//", "www.")) {
            // console.log(req.body.age, req.body.city, req.body.url);
            req.body.url = "";
        }

        db.addProfile(
            req.body.age,
            req.body.city,
            req.body.url,
            req.session.userId
        )
            .then(() => {
                res.redirect("/petition");

                // console.log("added");
            })
            .catch((err) => {
                console.log("error in hash in POST profile", err);
                res.render("profile", {
                    layout: "main",
                    error: true,
                });
            });
    }
});

app.get("/profile/edit", (req, res) => {
    db.getProfileInfo(req.session.userId)
        .then((results) => {
            let profile = results.rows[0];
            res.render("editprofile", {
                layout: "main",
                profile,
            });
        })
        .catch((err) => {
            console.log("error in hash in editing the profile", err);
            res.render("editprofile", {
                layout: "main",
                error: true,
            });
        });
});

app.post("/profile/edit", (req, res) => {
    if (req.body.password) {
        // console.log(req.body.password);
        hash(req.body.password)
            .then((hashedPw) => {
                db.editProfileInfo(
                    req.session.userId,
                    req.body.firstName,
                    req.body.lastName,
                    req.body.email,
                    hashedPw
                ).then((results) => {
                    // console.log("hashed user password:", hashedPw);
                    res.redirect("/profile/edit");
                });
            })
            .catch((err) => {
                console.log("error in hash in POST edit profle", err);
                res.render("editprofile", {
                    layout: "main",
                    error: true,
                });
            });
    }
});

app.listen(process.env.PORT || 8080, () => {
    console.log("server is listening");
});
