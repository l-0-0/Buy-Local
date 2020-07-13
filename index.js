const express = require("express");
const db = require("./db");

const app = express();

const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//for params and read the req.body
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (req.session.signed === "done") {
        res.redirect("/petition/signed");
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
        .then(() => {
            req.session.signed = "done";
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
                res.render("thankYou", {
                    layout: "main",
                    numberofSignatures,
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
        res.render("signed", {
            layout: "main",
        });
    }
});

app.listen(8080, () => {
    console.log("server is listening");
});
