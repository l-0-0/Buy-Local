const express = require("express");
const db = require("./db");
const cookieParser = require("cookie-parser");
const app = express();

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//for params and read the req.body
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/petition", (req, res) => {
    if (req.cookies.signed) {
        res.redirect("petition/signed");
    } else {
        res.render("petition", {
            layout: "main",
            error: false,
        });

        // db.getSignature()
        //     .then((results) => {
        //         // console.log("results", results.rows);
        //         //results = data we requested from db
        //         //results is a huge object with lots of stuff in it
        //         // we care about a property inside of results called "rows"
        //         // res.render() ???
        //     })
        //     .catch((err) => {
        //         console.log("err in GET", err);
        //     });
    }
});

// insert, delete or update a database is in post request
app.post("/petition", (req, res) => {
    // console.log(req.body.firstName, req.body.lastName, req.body.data);
    db.addSignature(req.body.firstName, req.body.lastName, req.body.data)
        .then(() => {
            res.render("thankYou", {
                layout: "main",
            });
            res.cookie("signed", true);
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
    if (!req.cookies.signed) {
        res.redirect("/petition");
    } else {
        res.render("thankYou", {
            layout: "main",
        });
    }
    db.getSigners().then((results) => {
        console.log("results", results);
    });
});

app.get("/petition/signed", (req, res) => {
    if (!req.cookies.signed) {
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
