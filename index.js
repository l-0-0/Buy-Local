const express = require("express");
const db = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");

const app = express();

module.exports.app = app;

const {
    isUserLoggedIn,
    isUserSigned,
    isUserNotSigned,
} = require("./middleware");

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

//it has to be after cookie session and urlencoded
app.use(csurf());

//it prevents of clickjacking
app.use(function (req, res, next) {
    res.setHeader("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.userId && req.url != "/login" && req.url != "/register") {
        res.redirect("/register");
    } else {
        next();
    }
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/petition", isUserSigned, (req, res) => {
    res.render("petition", {
        layout: "main",
        error: false,
    });
});

// insert, delete or update a database is in post request
app.post("/petition", isUserSigned, (req, res) => {
    db.addSignature(req.session.userId, req.body.data)
        .then((results) => {
            req.session.signed = "done";
            req.session.sigId = results.rows[0].id;
            res.redirect("/petition/thanks");
        })
        .catch((err) => {
            res.render("petition", {
                layout: "main",
                error: true,
            });
            console.log("err in POST", err);
        });
});

app.get("/petition/thanks", isUserNotSigned, (req, res) => {
    db.getSigners()
        .then((results) => {
            let numberofSignatures = results.rows[0].count;
            db.sigImage(req.session.sigId)
                .then((results) => {
                    let signatureUrl = results.rows[0].signature;

                    res.render("thankYou", {
                        layout: "main",
                        numberofSignatures,
                        signatureUrl,
                    });
                })
                .catch((err) => {
                    console.log("error in sigImage", err);
                });
        })
        .catch((err) => {
            console.log("err in GET", err);
        });
});

app.get("/petition/signed", isUserNotSigned, (req, res) => {
    db.getSignersName()
        .then((results) => {
            let signersName = results.rows;

            res.render("signed", {
                layout: "main",
                signersName,
            });
        })
        .catch((err) => {
            console.log("err in GET", err);
        });
});

app.get("/petition/signed/:city", isUserNotSigned, (req, res) => {
    let city = req.params.city;
    db.getSignersCity(city)
        .then((results) => {
            let signersName = results.rows;
            res.render("signed", {
                layout: "main",
                signersName,
                city,
            });
        })
        .catch((err) => {
            console.log("err in cities page", err);
            res.render("signed", {
                layout: "main",
                signersName,
                city,
                error: true,
            });
        });
});

app.get("/register", isUserLoggedIn, (req, res) => {
    res.render("registration", {
        layout: "main",
        error: false,
    });
});

app.post("/register", isUserLoggedIn, (req, res) => {
    hash(req.body.password)
        .then((hashedPw) => {
            db.register(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                hashedPw
            )
                .then((results) => {
                    req.session.userId = results.rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("error in hash in POST register", err);
                    res.render("registration", {
                        layout: "main",
                        error: true,
                    });
                });
        })
        .catch((err) => {
            console.log("error in send the info in POST register", err);
            res.render("registration", {
                layout: "main",
                error: true,
            });
        });
});

app.get("/login", isUserLoggedIn, (req, res) => {
    res.render("login", {
        layout: "main",
        error: false,
    });
});

app.post("/login", isUserLoggedIn, (req, res) => {
    db.getPassword(req.body.email)
        .then((results) => {
            if (!results.rows[0]) {
                res.render("login", {
                    layout: "main",
                    error: true,
                });
            } else {
                compare(req.body.password, results.rows[0].password)
                    .then((matchValue) => {
                        console.log(
                            "does the user password match our hash in the database?",
                            matchValue
                        );
                        if (matchValue) {
                            req.session.userId = results.rows[0].usersId;
                            req.session.sigId = results.rows[0].signaturesId;
                            req.session.signed = results.rows[0].signaturesId;
                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                layout: "main",
                                error: true,
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("error in maching the password", err);
                        res.render("login", {
                            layout: "main",
                            error: true,
                        });
                    });
            }
        })
        .catch((err) => {
            console.log("error in getting the email and password", err);
            res.render("login", {
                layout: "main",
                error: true,
            });
        });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    if (!req.body.age && !req.body.city && !req.body.url) {
        res.redirect("/petition");
    } else {
        if (!req.body.url.startsWith("https://", "http://", "//", "www.")) {
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
        hash(req.body.password)
            .then((hashedPw) => {
                db.updatePassword(req.session.userId, hashedPw).then(() => {});
            })
            .catch((err) => {
                console.log("error in hash in POST edit password", err);
            });
    }

    Promise.all([
        db.updateProfileInfo(
            req.session.userId,
            req.body.firstName,
            req.body.lastName,
            req.body.email
        ),
        db.upsertProfileInfo(
            req.session.userId,
            req.body.age,
            req.body.city,
            req.body.url
        ),
    ])
        .then((results) => {
            let city = req.body.city;
            let first = req.body.firstName;
            let last = req.body.lastName;
            let email = req.body.email;
            let age = req.body.age;
            let url = req.body.url;

            res.render("afterEditingProfile", {
                layout: "main",
                first,
                last,
                age,
                city,
                email,
                url,
            });
        })

        .catch((err) => {
            console.log("error in hash in POST edit profle", err);
            res.render("editprofile", {
                layout: "main",
                error: true,
            });
        });
});

app.post("/signature/delete", (req, res) => {
    db.deleteSig(req.session.userId)
        .then(() => {
            req.session.signed = "";
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in deleting the signature", err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => {
        console.log("server is listening");
    });
}
