const express = require("express");
const app = express();
const mysql = require("mysql");
const dbconn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "loginsystem",
});
dbconn.query(
  "CREATE TABLE IF NOT EXISTS users(email VARCHAR(100), username VARCHAR(100), password VARCHAR(255), PRIMARY KEY(email))"
);

app.get("/", (req, res) => {
  res.render("home.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("signup.ejs");
});

app.listen(3001, () => console.log("Server running on port 3001"));
