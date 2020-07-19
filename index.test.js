//npm test

const supertest = require("supertest");
const { app } = require("./index.js");
const cookieSession = require("cookie-session");

test(" GET / logged out users get redirected to the registration page when they attempt to go to the petition page", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/petition")
        .then((response) => {
            // console.log(response);
            expect(response.headers.location).toBe("/register");
        });
});

test("GET/ loggedin users redirected to the petition page when they go to the registration or the login page", () => {
    cookieSession.mockSessionOnce({
        userId: true,
    });
    return supertest(app)
        .get("/register" || "/login")
        .then((response) => {
            // console.log(response);
            expect(response.headers.location).toBe("/petition");
        });
});

test("POST / loggedin signers redirected to the thanksPage when they sign the petition", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        signed: "done",
    });
    return supertest(app)
        .post("/petition")
        .then((response) => {
            // console.log(response);
            expect(response.headers.location).toBe("/petition/thanks");
        });
});
test("GET / loggedin signers redirected to the thanksPage when they go to the petition", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        signed: "done",
    });
    return supertest(app)
        .get("/petition")
        .then((response) => {
            // console.log(response);
            expect(response.headers.location).toBe("/petition/thanks");
        });
});

test("GET / loggedin notSIgned users redirected to the petition when they go to the thanks or the signers page", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        signed: false,
    });
    return supertest(app)
        .get("/petition/thanks" || "/petition/signed")
        .then((response) => {
            // console.log(response);
            expect(response.headers.location).toBe("/petition");
        });
});
