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
    db.addSignature(req.session.registered, req.body.data)
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
                let signersName = [];
                for (let i = 0; i < results.rows.length; i++) {
                    // console.log(results.rows[i].first);
                    signersName.push(
                        `${results.rows[i].first} ${results.rows[i].last}`
                    );
                }
                // console.log(signersName, results.rows);
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
                req.session.registered = results.rows[0].id;
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
        // console.log(req.body.email, results.rows[0].password);
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
                        req.session.isLoged = results.rows[0].id;
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
    // console.log(req.body.age, req.body.city, req.body.homepage);
    if (req.body.homepage.startsWith("https://", "http://", "//")) {
        db.addProfile(
            req.body.age,
            req.body.city,
            req.body.homepage
        ).then((results) => {});
    } else {
    }
});

app.listen(process.env.PORT || 8080, () => {
    console.log("server is listening");
});
