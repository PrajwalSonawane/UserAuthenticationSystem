const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Welcome to user Auth API",
    message: "This message confirms API is working",
  });
});

router.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const checkUserResponse = await db.query(
    `select * from users where username = '${username}'`
  );
  if (checkUserResponse.rows.length == 0) {
    const createUserQuery = `insert into users(username, name, password, gender, location) 
      values('${username}','${name}','${hashedPassword}','${gender}','${location}')`;
    if (password.length > 5) {
      const createUser = await db.query(createUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send(`User already exists`);
  }
});

router.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checkUserQuery = `select * from users where username = '${username}'`;
  const userNameResponse = await db.query(checkUserQuery);
  if (userNameResponse.rows.length > 0) {
    const isPasswordMatched = await bcrypt.compare(
      password,
      userNameResponse.rows[0].password
    );
    if (isPasswordMatched) {
      response.status(200);
      response.send(`Login success!`);
    } else {
      response.status(400);
      response.send(`Invalid password`);
    }
  } else {
    response.status(400);
    response.send(`Invalid user`);
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
        response.send("Password updated");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  } else {
    response.status(400);
    response.send(`Invalid user`);
  }
});

router.get("/message-list", async (request, response) => {
  const messageList = await db.query(
    "select message from users where message IS NOT NULL"
  );
  return response.status(200).json(messageList.rows);
});

module.exports = router;
