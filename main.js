const express = require("express");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

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

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "keyboard",
    resave: false,
    saveUninitialized: false,
  })
);
app.use((req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
  } else {
    res.locals.user = null; // falsy values -  null, undefined , 0
  }
  next();
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("login.ejs");
  }
});
app.post("/login", (req, res) => {
  // logic
  // check if email is register
  // if so, compare password
  // if password is correct, create a session
  dbconn.query(
    "SELECT * FROM users WHERE email = ?",
    [req.body.email],
    (err, data) => {
      //always handle errors
      if (data.length > 0) {
        // proceed
        bcrypt.compare(req.body.pass, data[0].password, (err, isMatch) => {
          if (isMatch) {
            // create a session
            req.session.user = data[0];
            req.res.redirect("/");
          } else {
            res.render("login.ejs", {
              errorMessage: "Email of Password incorrect",
            });
          }
        });
      } else {
        res.render("login.ejs", {
          errorMessage: "Email of Password incorrect",
        });
      }
    }
  );
});
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
app.get("/register", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("signup.ejs");
  }
});
app.post("/register", (req, res) => {
  // logic
  // check if email is in db and if so ask the to login
  // encrypt password and insert the data to db
  dbconn.query(
    "SELECT email FROM users WHERE email = ?",
    [req.body.email],
    (err, data) => {
      //always handle errors
      if (data.length > 0) {
        res.render("signup.ejs", { errorMessage: "Email already exists" });
      } else {
        bcrypt.hash(req.body.pass, saltRounds, (err, hashedPass) => {
          dbconn.query(
            "INSERT INTO users(email,username,password) VALUES (?,?,?)",
            [req.body.email, req.body.username, hashedPass],
            (err) => {
              if (!err) {
                // succesful signup!!
                res.redirect("/login");
              } else {
                res.render("signup.ejs", {
                  errorMessage: "Server Error. Contact Admin.",
                });
              }
            }
          );
        });
      }
    }
  );
});

app.get("/cars", (req, res) => {
  if (req.session.user) {
    //continues
    res.render("cars.ejs");
  } else {
    res.redirect("/login");
  }
});
app.get("/cars/type", (req, res) => {
  console.log(req.query.cat);
  console.log(req.query.model);
  // go to db use Where clause -- select * from vehicles where category = ?  [req.query.cat]
  res.render("carscat.ejs", { category: req.query.cat });
});

app.listen(3001, () => console.log("Server running on port 3001"));
