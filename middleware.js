//user logged in or registred?when user tries to go to login or registration page. 
//if they already registered or logged in they don't see these pages.
module.exports.requiredLoggedOutUser = function requiredLoggedOutUser (req, res, next) {
    // if the user logged in? 
    if (req.session.userId) {
        res.redirect("/petition");
    } esle{
        //runs if the user is not loigged in
        next();
    }
}
 //then we have to call this middle ware in our server (index.js). so we have to export it.
//then we have to import it there
//const { requiredLoggedOutUser } = require("./middleware");
//./ means the file lives in the same folder as index.js
// use the middleware function: goes to the route that it has to run on it.
//app.get("/register", requiredLoggedOutUser, (req,res)=>{
//     res.sendStatus(200);
// })
//we put it also in the post route just to be secure. 
//we can put several middleware functions seprated with a comma, if the first one works
//the second one doesn't.

//user should allow to see the petition page if they didn't sign, otherwise they can't. 
//so we write a middleware for that. if they didn't sign they are allowed to see the petition.

module.exports.requireNoSignature = function requireNoSignature (req, res, next){
    //has the user signed the petition?
    if(req.session.sigId){
        res.redirect("/thanks");
    } else{
        next();
    }

}

//import the middleware functions to the index.js
//const { requiredLoggedOutUser, requireNoSignature } = require("./middleware");

//if the users signed the petition, they should be only allowed to see the thanks pages
//if they haven't, we redirect them to the petition and force them to sign

module.exports.requireSignature = function requireSignature (req, res, next){
    //has the user signed the petition? I have to check the name of my cookies
    if(!req.session.sigId){
        res.redirect("/petition");
    } else{
        next();
    }

}

//import the middleware functions to the index.js
//const { requiredLoggedOutUser, requireNoSignature, requireSignature } = require("./middleware");
//add it to thanks, signers and signers city

//if the user is not logged in 
module.exports.requireLoggedInUser = function requireSignature (req, res, next){
    //check if user is not logged in, if they are in they can acess every page. 
    //if they are not, they have to first log in or register. 
    if(){

        res.redirect("/register");
    } else{
        next();
    }

}