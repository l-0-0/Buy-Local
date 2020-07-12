const express = require("express");
const db = require("./db");
const app = express();

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get("/", (req, res) => {
    //go to the petition and talk to the db and then
    res.render("petition", {
        layout: "main",
        // results,
    });

    db.getSignature()
        .then((results) => {
            console.log(results);
            //results = data we requested from db
            //results is a huge object with lots of stuff in it
            // we care about a property inside of results called "rows"
            // res.render() ???
        })
        .catch((err) => {
            console.log("err in GET", err);
        });
});

// insert, delete or update a database is in post request
app.post("/", (req, res) => {
    // console.log(req.body.firstName, req.body.lastName, req.body.data);
    db.addSignature(req.body.firstName, req.body.lastName, req.body.data)
        .then(() => {
            //any code writing here will run after getSignature has run
            res.render("thankYou", {
                layout: "main",
            });
        })
        .catch((err) => {
            console.log("err in POST", err);
        });
});

app.listen(8080, () => {
    console.log("server is listening");
});
