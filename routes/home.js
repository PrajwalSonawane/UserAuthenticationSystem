const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const databasePath = path.join(__dirname, "../userData.db");
console.log(databasePath);
let database = null;
const db = require('../db');

const initializeDnAndServer = async () => {
    try {
        database = await open({ filename: databasePath, driver: sqlite3.Database });
    } catch (error) {
        console.log(`Database Error is ${error}`);
        process.exit(1);
    }
};
  
initializeDnAndServer();

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

router.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  //encrypt password
  const hashedPassword = await bcrypt.hash(password, 10);
  // check if user exists
  //const checkUserQuery = `select username from user where username = '${username}';`;
  const checkUserResponse = await db.query(`select * from users where username = '${username}'`);
  //const checkUserResponse = await database.get(checkUserQuery);
  console.log(checkUserResponse.rows);
  if (checkUserResponse.rows.length == 0) {
    const createUserQuery = `
      insert into users(username,name,password,gender,location) 
      values('${username}','${name}','${hashedPassword}','${gender}','${location}')`;
    if (password.length > 5) {
      const createUser = await db.query(createUserQuery);
      response.send("User created successfully"); //Scenario 3
    } else {
      response.status(400);
      response.send("Password is too short"); //Scenario 2
    }
  } else {
    response.status(400);
    response.send(`User already exists`); //Scenario 1
  }
});

router.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checkUserQuery = `select * from users where username = '${username}'`;
  const userNameResponse = await db.query(checkUserQuery);
  console.log(userNameResponse.rows);
  if (userNameResponse.rows.length > 0) {
    const isPasswordMatched = await bcrypt.compare(
      password,
      userNameResponse.rows[0].password
    );
    if (isPasswordMatched) {
      response.status(200);
      response.send(`Login success!`); // Scenario 3
    } else {
      response.status(400);
      response.send(`Invalid password`); // Scenario 2
    }
  } else {
    response.status(400);
    response.send(`Invalid user`); //Scenario 1
  }
});

router.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkUserQuery = `select * from users where username = '${username}'`;
  const userDetails = await db.query(checkUserQuery);
  if (userDetails.rows.length > 0) {
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      userDetails.rows[0].password
    );
    if (isPasswordValid) {
      if (newPassword.length > 5) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `update users set 
        password = '${hashedPassword}' where username = '${username}';`;
        const updatePasswordResponse = await db.query(updatePasswordQuery);
        response.status(200);
        response.send("Password updated"); //Scenario 3
      } else {
        response.status(400);
        response.send("Password is too short"); //Scenario 2
      }
    } else {
      response.status(400);
      response.send("Invalid current password"); //Scenario 1
    }
  } else {
    response.status(400);
    response.send(`Invalid user`); // Scenario 4
  }
});

router.get("/message-list", async (request, response) => {
  const messageList = await db.query('select message from users where message IS NOT NULL');
  return response.status(200).json(messageList.rows);
});


module.exports = router;
