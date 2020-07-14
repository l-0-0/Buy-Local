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
    db.addSignature(req.body.firstName, req.body.lastName, req.body.data)
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

app.get("/register", (req, res) => {
    if (req.session.signed === "done") {
        res.redirect("/petition/thanks");
    } else {
        res.render("registration", {
            layout: "main",
            error: false,
        });
    }
});

app.listen(8080, () => {
    console.log("server is listening");
});
